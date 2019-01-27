// Adds user with a given username via the command line
//

const users = require('../authentication/users');
const mongoose = require('mongoose');
const secure = require('../secure_settings');
mongoose.Promise = global.Promise;

async function updateStatus(username) {
    if (username) {
        await mongoose.connect(secure.MONGODB_URI);

        await users.updateAdminStatus(username, true);
        console.log(`User "${username}" is now marked as an admin user.`);
    } else {
        console.error(`  No username passed in to command line. Example usage:`)
        console.log(`    node path/to/add-admin-user.script.js dumber@example.com`);
    }
}

const username = process.argv[2];
updateStatus(username).then(() => process.exit(0));
