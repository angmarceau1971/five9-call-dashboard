const five9 = require('../helpers/five9-interface');
const log = require('../helpers/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for user data
const usersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    active: Boolean,
    isAdmin: { type: Boolean, default: false }
});

// Model to store users
const Users = mongoose.model('Users', usersSchema);


// Checks if "username" is an active user in this system.
// Async, as this function will wait for User database updates to complete
// before sending a response (if database is in the middle of an update).
// @param username - User to check
// @return Boolean - This is an active user
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

async function refreshUserDatabase(usersModel) {
    // Save original list to preserve admin status
    let original = await Users.find({});

    let data = await five9.getUsersGeneralInfo();
    // Clear the old list
    await usersModel.remove({}, (err, success) => {
        if (err) log.error(`Error deleting data in Users model: ${err}`);
    });
    // Only leave the `username` and `active` fields
    let cleanData = data.map((d, i) => {
        let newUser = {
            username: d.userName,
            active: d.active == 'true' ? true : false
        };
        newUser.isAdmin = getAdminFromData(newUser.username, original);
        return newUser;
    });
    // Insert to collection
    return usersModel.collection.insert(cleanData, (err, docs) => {
        if (err) log.error(`Error inserting data in Users model: ${err}`);
    });
}

/**
 * @param  {String}  username to check on
 * @return {Boolean} true if user is an admin
 */
async function isAdmin(username) {
    let user = await Users.findOne({ username: username });
    if (!user || !user.isAdmin) return false;
    return true;
}

function getAdminFromData(username, data) {
    for (let i=0; i < data.length; i++) {
        if (data[i].username == username) return data[i].isAdmin;
    }
    return false;
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

module.exports.isAdmin = isAdmin;
module.exports.isActive = isActive;
module.exports.scheduleUpdate = scheduleUpdate;
module.exports.refreshUserDatabase = refreshUserDatabase;
