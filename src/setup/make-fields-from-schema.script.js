// Creates fields from schemas, if current field list is blank
//

const report = require('../models/report');
const fields = require('../admin/fields');

const mongoose = require('mongoose');
const secure = require('../secure_settings');
mongoose.Promise = global.Promise;

async function updateFields() {
    await mongoose.connect(secure.MONGODB_URI, {
       useMongoClient: true,
    });

    let acdpaths = report.acdFeedSchema.paths;
    let res = await fields.initializeList(acdpaths, 'AcdFeed');
    console.log(res);

    let callLogPaths = report.callLogSchema.paths;
    res = await fields.initializeList(callLogPaths, 'CallLog');
    console.log(res);
}

updateFields().then(() => process.exit(0));
