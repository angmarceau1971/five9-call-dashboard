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

    let tables = [
        {
            schema: 'acdFeedSchema',
            source: 'AcdFeed'
        },
        {
            schema: 'callLogSchema',
            source: 'CallLog'
        },
        {
            schema: 'agentLoginSchema',
            source: 'AgentLogin'
        }
    ];
    for (let item of tables) {
        log.message(`Adding ${item.source} fields...`);
        let paths = report[item.schema].paths;
        let res = await fields.initializeList(paths, item.source);
        log.message(JSON.stringify(res));
    };
}

if (require.main == module) {
    updateFields()
        .then(() => process.exit(0))
        .catch((err) => log.error(`Error during make-fields: ${err}.`));
}
