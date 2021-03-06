const clone = require('ramda/src/clone');
const flatten = require('ramda/src/flatten');
const uniq = require('ramda/src/uniq');
const five9 = require('../utility/five9-interface');
const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const models = require('../datasources/five9-models');

// Lookup to determine which skills this agent should be taking
const skillGroup = require('../datasources/skill-group.js');

// Default user theme
const DefaultTheme = {
    color: 'dark',
    colorQueues: 'dark',
    lightBackgroundImageUrl: '',
    darkBackgroundImageUrl: '',
    useBackgroundImage: false,
};

//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for user data
const usersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        unique: true,
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
        // dark or light theme
        color: {
            type: String,
            default: DefaultTheme.color,
        },
        // dark or light theme for Queues page
        colorQueues: {
            type: String,
            default: DefaultTheme.colorQueues,
        },
        lightBackgroundImageUrl: {
            type: String,
            default: DefaultTheme.lightBackgroundImageUrl,
        },
        darkBackgroundImageUrl: {
            type: String,
            default: DefaultTheme.darkBackgroundImageUrl,
        },
        useBackgroundImage: {
            type: Boolean,
            default: DefaultTheme.useBackgroundImage,
        },
    },
    // Last time that user accessed page or API
    lastActive: {
        type: Date,
    },
    // Last time user was logged in to Five9
    lastLoggedInTime: {
        type: Date,
    },
});

// Model to store users
const Users = mongoose.model('Users', usersSchema);
module.exports.Users = Users;


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
async function getUser(username) {
    const user = await Users.findOne({ username: username }).lean().exec();
    const skillGroups = skillGroup.getFromAgentGroup(user.agentGroups[0]);
    const skills = uniq(flatten(skillGroups.map((group) => group.skills)));
    const skillGroupNames = uniq(skillGroups.map((group) => group.name));

    return Object.assign(user, {
        skills: skills,
        skillGroups: skillGroupNames
    });
}
module.exports.getUserInformation = getUser;
module.exports.getUser = getUser;

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

/**
 * Returns Array of users who have logged in since `date`
 */
async function getUsersActiveSince(date) {
    return await Users.find(
        { lastLoggedInTime: { $gte: date } },
        'username lastName firstName agentGroups',
    ).lean().exec();
}
module.exports.getUsersActiveSince = getUsersActiveSince;

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

/**
 * Set user's lastActive attribute to now
 * @param  {String} username
 * @return {Promise}
 */
async function updateLastActive(username) {
    return await Users.updateOne(
        { username: username },
        { $set: { 'lastActive': Date.now() } }
    );
}
module.exports.updateLastActive = updateLastActive;

/**
 * Returns array of Users who have logged in within last @param interval seconds
 * @param  {Number} interval in seconds
 * @return {[Users]}
 */
async function getActive(interval) {
    let start = new Date();
    start.setSeconds(start.getSeconds() - interval);
    return await Users.find(
        { lastActive: { $gte: start } }
    ).lean().exec();
}
module.exports.getActive = getActive;


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

    // Iterate over data and update DB
    let cleanData = await Promise.all(data.map(async (d, i) => {
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
            newUser.theme = DefaultTheme;
        }

        // Update last Five9 login time
        try {
            newUser.lastLoggedInTime = await models.getLastLoggedInTime(newUser.username);
        } catch (err) {
            console.error(err)
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
    }));

    // Remove users who aren't in the new data
    originalUsers.forEach((user) => {
        if (!cleanData.find((newUser) => newUser.username == user.username)) {
            usersModel.findOneAndUpdate(
                { $and: [ { username: user.username }, { active: true } ] },
                { $set: { active: false } },
                { }, // options
                function(err, doc) {
                    if (err) log.error(`Error when removing no-longer-existent user ${user.username}: ${err}`, 'user status');
                }
            );
        }
    });
}
module.exports.refreshUserDatabase = refreshUserDatabase;
