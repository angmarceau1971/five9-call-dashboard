// Adds user with a given username via the command line
//

const users = require('./users');

const username = process.argv[2];
if (username) {
    users.updateAdminStatus(username, true);
    console.log(`User "${username}" is now marked as an admin user.`);
} else {
    console.error(`  No username passed in to command line. Example usage:`)
    console.log(`    node path/to/add-admin-user.script.js dumber@example.com`);
}
