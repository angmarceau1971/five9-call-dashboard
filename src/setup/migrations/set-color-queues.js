// Sets each user's `theme.colorQueues` property, if undefined, equal to their
// `theme.color` property

const users = require('../../authentication/users');
const mongoose = require('mongoose');
const secure = require('../../secure_settings');
const database = require('../../utility/database'); // connection instance to DB
mongoose.Promise = global.Promise;

async function setColorQueueForAllUsers(username) {

	await database.connect();

	let undefinedUsers = await users.Users.find({});
	for (let user of undefinedUsers) {
		console.log(user.username, user.theme.color);
		if (user.theme.colorQueues !== undefined) {
			console.log(`Skipping User ${user.username}; colorQueues already set to ${user.theme.colorQueues}!`);
		}
		await users.Users.findOneAndUpdate(
			{ username: user.username },
			{ 'theme.colorQueues': user.theme.color },
		)
	}
}

setColorQueueForAllUsers().then(() => process.exit(0)).catch((err) => {
	console.error(err); process.exit(0);
});
