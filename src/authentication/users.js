const clone = require('ramda/src/clone');
const flatten = require('ramda/src/flatten');
const uniq = require('ramda/src/uniq');
const five9 = require('../utility/five9-interface');
const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Lookup to determine which skills this agent should be taking
const skillGroup = require('../models/skill-group.js');


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
    // Array of Agent Groups that user belongs to
    agentGroups: [String],
    firstName: String,
    lastName: String,
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
        log.message(`Users.isActive called while database is updating; waiting 1000ms.`);
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

function getAdminFromData(username, data) {
    for (let i=0; i < data.length; i++) {
        if (data[i].username == username) return data[i].isAdmin;
    }
    return false;
}

/**
 * Get user data object with fields:
 *      agentGroups, skillGroups, skills, isAdmin, active, username
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
            return group.agents.includes(username);
        })
        .map(function getGroupName(group) {
            return group.name[0];
        });
}

async function getAdminUsers() {
    return await Users.find({ isAdmin: true });
}
module.exports.getAdminUsers = getAdminUsers;

/**
 * @param  {String}  username
 * @param  {Boolean} isNowAdmin new admin status for user
 * @return
 */
async function updateAdminStatus(username, isNowAdmin) {
    log.message(`Updating admin status for ${username} to ${isNowAdmin}.`);
    return await Users.updateOne(
        { username: username },
        { $set: { 'isAdmin': isNowAdmin } }
    );
}
module.exports.updateAdminStatus = updateAdminStatus;

/**
 * Update user's theme fields.
 * @param  {String} username
 * @param  {Object} newTheme with fields theme, lightBackgroundImageUrl, and
 *                           darkBackgroundImageUrl
 * @return {Promise}
 */
async function updateTheme(username, newTheme) {
    log.message(`Updating theme for ${username} to ${JSON.stringify(newTheme)}.`);
    return await Users.updateOne(
        { username: username },
        { $set: {
            'theme': newTheme
        } }
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
    log.message(`Updating users database`);
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
        log.error(`No users data returned by Five9! Aborting Users update.`);
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
            theme: {
                color: 'dark',
                lightBackgroundImageUrl: '',
                darkBackgroundImageUrl: ''
            }
        };

        // Update or add each Five9 user to database
        // http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findAndModify
        usersModel.collection.findAndModify(
            { username: newUser.username }, // query
            [], // sort
            { $set: newUser }, // update
            // options - add to collection if not found
            { upsert: true, setDefaultsOnInsert: true },
            function(err, doc) {
                if (err) log.error(`Error while updating user: ${err}.`);
            }
        );
        return newUser;
    });

    // Remove users who aren't in the new data
    originalUsers.forEach((user) => {
        if (!cleanData.find((newUser) => newUser.username == user.username)) {
            usersModel.remove(
                { username: user.username },
                function(err, doc) {
                    if (err) log.error(`Error when removing user: ${err}`);
                    log.message(`Removing user ${user.username} from Users table.`);
                }
            );
        }
    });

}
module.exports.refreshUserDatabase = refreshUserDatabase;
