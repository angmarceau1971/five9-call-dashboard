const clone = require('ramda/src/clone');
const flatten = require('ramda/src/flatten');
const uniq = require('ramda/src/uniq');
const five9 = require('../utility/five9-interface');
const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Lookup to determine which skills this agent should be taking
const skillGroup = require('../datasources/skill-group.js');


//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for user data
const usersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        unique: true
    },
    active: Boolean,
    isAdmin: { type: Boolean, default: false },
    isSupervisor: { type: Boolean, default: false },
    // Array of Agent Groups that user belongs to
    agentGroups: [String],
    firstName: String,
    lastName: String,
    fullName: String,
    // Theme options
    theme: {
        color: { // dark or light theme
            type: String,
            default: 'dark'
        },
        lightBackgroundImageUrl: {
            type: String,
            default: ''
        },
        darkBackgroundImageUrl: {
            type: String,
            default: ''
        },
        useBackgroundImage: {
            type: Boolean,
            default: false
        }
    }
});

// Model to store users
const Users = mongoose.model('Users', usersSchema);


////////////////////////////////////////////////
// Access methods
////////////////////////////////////////////////

/**
 * Checks if "username" is an active user in this system.
 * Async, as this function will wait for User database updates to complete
 * before sending a response (if database is in the middle of an update).
 * @param  {String}  username User to check
 * @return {Promise -> Boolean}
 */
async function isActive(username) {
    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    let waited = 0;
    while (currentlyUpdatingData && waited < 30000) {
        log.debug(`Users.isActive called while database is updating; waiting 1000ms.`);
        waited += 1000;
        await wait(1000);
    }
    let user = await Users.findOne({ username: username });
    return user != null && user.active;
}
module.exports.isActive = isActive;

/**
 * @param  {String}  username to check on
 * @return {Boolean} true if user is an admin
 */
async function isAdmin(username) {
    let user = await Users.findOne({ username: username });
    if (!user || !user.isAdmin) return false;
    return true;
}
module.exports.isAdmin = isAdmin;

/**
 * @param  {String}  username to check on
 * @return {Boolean} true if user is an admin
 */
async function isSupervisor(username) {
    let user = await Users.findOne({ username: username });
    if (!user || !user.isSupervisor) return false;
    return true;
}
module.exports.isSupervisor = isSupervisor;

async function getFullName(username) {
    let user = await Users.findOne({ username: username });
    return `${user.lastName}, ${user.firstName}`;
}
module.exports.getFullName = getFullName;

/**
 * Get user object, including additional fields:
 *      skillGroups, skills
 *
 * @param  {String} username
 * @return {Object}
 */
async function getUserInformation(username) {
    const user = await Users.findOne({ username: username }).lean().exec();
    const skillGroups = skillGroup.getFromAgentGroup(user.agentGroups[0]);
    const skills = uniq(flatten(skillGroups.map((group) => group.skills)));
    const skillGroupNames = uniq(skillGroups.map((group) => group.name));

    return Object.assign(user, {
        skills: skills,
        skillGroups: skillGroupNames
    });
}
module.exports.getUserInformation = getUserInformation;

/**
 * Returns array of all Agent Groups user is assigned to
 * @param  {String} username
 * @param  {Array}  data     response from five9.getAgentGroups
 * @return {Array of Strings} agent groups that include agent
 */
function getAgentGroupsForAgent(username, data) {
    return data
        .filter(function hasAgent(group) {
            return group.agents
                ? group.agents.includes(username)
                : false;
        })
        .map(function getGroupName(group) {
            return group.name[0];
        });
}

// Returns Array of users (only username & name fields)
async function getUsers() {
    return await Users.find({}, 'username lastName firstName agentGroups').lean().exec();
}
module.exports.getUsers = getUsers;

async function getAdminUsers() {
    return await Users.find({ isAdmin: true }).lean().exec();
}
module.exports.getAdminUsers = getAdminUsers;

async function getSupervisorUsers() {
    return await Users.find({ isSupervisor: true }).lean().exec();
}
module.exports.getSupervisorUsers = getSupervisorUsers;


/**
 * @param  {String}  username
 * @param  {Boolean} isNowAdmin new admin status for user
 * @return {Promise}
 */
async function updateAdminStatus(username, isNowAdmin) {
    log.info(`Updating admin status for ${username} to ${isNowAdmin}.`, 'user status');
    return await Users.updateOne(
        { username: username },
        { $set: { 'isAdmin': isNowAdmin } }
    );
}
module.exports.updateAdminStatus = updateAdminStatus;

/**
 * @param  {String}  username
 * @param  {Boolean} isNowSup new supervisor status for user
 * @return {Promise}
 */
async function updateSupervisorStatus(username, isNowSup) {
    log.info(`Updating supervisor status for ${username} to ${isNowSup}.`, 'user status');
    return await Users.updateOne(
        { username: username },
        { $set: { 'isSupervisor': isNowSup } }
    );
}
module.exports.updateSupervisorStatus = updateSupervisorStatus;

/**
 * Update user's theme fields.
 * @param  {String} username
 * @param  {Object} newTheme with fields theme, lightBackgroundImageUrl,
 *                           darkBackgroundImageUrl, useBackgroundImage
 * @return {Promise}
 */
async function updateTheme(username, newTheme) {
    log.info(`Updating theme for ${username} to ${JSON.stringify(newTheme)}.`, 'user status');
    return await Users.updateOne(
        { username: username },
        { $set: { 'theme': newTheme } }
    );
}
module.exports.updateTheme = updateTheme;


////////////////////////////////////////////////
// Database updating
////////////////////////////////////////////////

// Update from Five9 every ${interval} seconds
// Returns ID for setTimeout timer
let currentlyUpdatingData = false;
async function scheduleUpdate(interval) {
    currentlyUpdatingData = true;
    log.info(`Updating users database`, 'data upload');
    await refreshUserDatabase(Users);

    currentlyUpdatingData = false;
    return setTimeout(() => scheduleUpdate(interval), interval);
}
module.exports.scheduleUpdate = scheduleUpdate;

/**
 * Update Users table based on Five9 API data.
 *
 * Will only update fields username, active, and agentGroups in table. Users
 * who are missing entirely from Five9 data will be deleted.
 *
 * @param  {Model} usersModel Mongoose model
 * @return
 */
async function refreshUserDatabase(usersModel) {
    // Save original list to preserve admin status
    let originalUsers = await Users.find({});

    // Get the dataz from Five9
    let [data, agentGroupData] = await Promise.all([
        five9.getUsersGeneralInfo(),
        five9.getAgentGroups()
    ]);

    if (!data || !data.length) {
        log.error(`No users data returned by Five9! Aborting Users update.`, 'data upload');
        return;
    }

    // Iterate over data
    let cleanData = data.map((d, i) => {
        // Only leave the fields needed
        let newUser = {
            username: d.userName[0],
            active: d.active == 'true' ? true : false,
            agentGroups: getAgentGroupsForAgent(d.userName[0], agentGroupData),
            firstName: d.firstName[0],
            lastName: d.lastName[0],
            fullName: `${d.lastName[0]}, ${d.firstName[0]}`
        };

        // Check if original copy of user had theme object defined -- if not,
        // add it
        let oldUser = originalUsers.find((user) => user.username == newUser.username);
        if (!oldUser || !oldUser.theme) {
            newUser.theme = {
                color: 'dark',
                lightBackgroundImageUrl: '',
                darkBackgroundImageUrl: '',
                useBackgroundImage: ''
            };
        }

        // Update or add each Five9 user to database
        // http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findAndModify
        usersModel.findOneAndUpdate(
            { username: newUser.username }, // query
            { $set: newUser }, // update
            // options - add to collection if not found
            { upsert: true, setDefaultsOnInsert: true },
            function(err, doc) {
                if (err) log.error(`Error while updating user: ${err}.`, 'data upload');
            }
        );
        return newUser;
    });

    // Remove users who aren't in the new data
    originalUsers.forEach((user) => {
        if (!cleanData.find((newUser) => newUser.username == user.username)) {
            usersModel.findOneAndUpdate(
                { username: user.username },
                { $set: { active: false } },
                { }, // options
                function(err, doc) {
                    if (err) log.error(`Error when removing no-longer-existent user ${user.username}: ${err}`, 'user status');
                    log.info(`Marking no-longer-existent user ${user.username} as inactive in Users table.`, 'user status');
                }
            );
        }
    });

}
module.exports.refreshUserDatabase = refreshUserDatabase;
