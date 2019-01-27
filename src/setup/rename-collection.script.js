//

const report = require('../datasources/report');
const fields = require('../admin/fields');

const mongoose = require('mongoose');
const secure = require('../secure_settings');
mongoose.Promise = global.Promise;

async function rename(oldName, newName) {
    await mongoose.connect(secure.MONGODB_URI);

    mongoose.connection.db.collection(oldName).rename(newName)
        .then(() => console.log('rename successful'))
        .catch((err) => console.error(err));
}

const oldName = process.argv[2].trim();
const newName = process.argv[3].trim();
if (!oldName || !newName) {
    throw new Error(`oldName or newName not defined!`);
}
else {
    rename(oldName, newName).then(() => process.exit(0));
}
