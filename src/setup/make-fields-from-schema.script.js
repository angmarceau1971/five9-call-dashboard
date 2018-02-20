// Creates fields from schemas, if current field list is blank
//

const report = require('../models/report');
const fields = require('../admin/fields');
const log = require('../utility/log');

const mongoose = require('mongoose');
const secure = require('../secure_settings');
mongoose.Promise = global.Promise;

async function updateFields() {
    await mongoose.connect(secure.MONGODB_URI, {
       useMongoClient: true,
    });

    log.message(`Adding AcdFeed fields...`);
    let acdpaths = report.acdFeedSchema.paths;
    let res = await fields.initializeList(acdpaths, 'AcdFeed');
    log.message(JSON.stringify(res));

    log.message(`Adding CallLog fields...`);
    let callLogPaths = report.callLogSchema.paths;
    res = await fields.initializeList(callLogPaths, 'CallLog');
    log.message(JSON.stringify(res));

    log.message(`Adding AgentLogin fields...`);
    let agentLoginPaths = report.agentLoginSchema.paths;
    res = await fields.initializeList(agentLoginPaths, 'CallLog');
    log.message(JSON.stringify(res));
}

if (require.main == module) {
    updateFields()
        .then(() => process.exit(0))
        .catch((err) => log.error(`Error during make-fields: ${err}.`));
}
