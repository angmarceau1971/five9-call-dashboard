const five9 = require('../helpers/five9-interface');
const log = require('../helpers/log');
const mongoose = require('mongoose');


//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for queue data
const queueStatsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    SkillName: { type: String, default: 'N/A' },
    AgentsLoggedIn: { type: String, default: '0 (0)' },
    AgentsNotReadyForCalls: { type: Number, default: 0 },
    AgentsOnCall: { type: Number, default: 0 },
    AgentsReadyForCalls: { type: Number, default: 0 },
    AgentsReadyForVMs: { type: Number, default: 0 },
    CallsInQueue: { type: Number, default: 0 },
    CurrentLongestQueueTime: { type: Number, default: 0 },
    LongestQueueTime: { type: Number, default: 0 },
    QueueCallbacks: { type: Number, default: 0 },
    TotalVMs: { type: Number, default: 0 },
    VMsInProgress: { type: Number, default: 0 },
    VMsInQueue: { type: Number, default: 0 }
});

// Stats model
const QueueStats = mongoose.model('QueueStats', queueStatsSchema);

//////////////////////////////////////////
// Database updating
let currentlyUpdatingData = false;
// Update from Five9 every ${interval} seconds
// Returns ID for setTimeout timer
async function scheduleUpdate(interval) {
    currentlyUpdatingData = true;

    // ensure session is open
    await five9.openStatisticsSession();

    // update from Five9
    await refreshDatabase();

    // Schedule next update
    currentlyUpdatingData = false;
    return setTimeout(() => scheduleUpdate(interval), interval);
}

async function refreshDatabase() {
    let params, response, data;

    // Remove all old data
    await QueueStats.remove({});

    try {
        // Pull in the new stuff
        params = five9.getParameters('getStatistics');
        response = await five9.request(params, 'statistics');

        // Get the data into a nice JSON / DB friendly format with keys + values
        // for each document
        data = jsonToViewData(response);

        // add to database
        return QueueStats.collection.insert(data, (err, docs) => {
            if (err) log.error(`Error inserting data in report model: ${err}`);
        });
    } catch (err) {
        log.error(`Error during QueueStats update. Error: ${err.toString()}; `
                  + `Data: ${JSON.stringify(data)}; `
                  + `openStatisticsSession response: ${JSON.stringify(response)}`);
    }
}


async function getData() {
    return await QueueStats.find({});
}



// Return formatted column / key assignments
// Takes JSON generated from original Five9 SOAP API response
function jsonToViewData(json,
        includeFields=['SkillName', 'CallsInQueue',
                        'CurrentLongestQueueTime', 'AgentsLoggedIn',
                        'AgentsNotReadyForCalls', 'AgentsOnCall',
                        'AgentsReadyForCalls']) {
    // Remove spaces from column headers
    let columns = json['columns'][0]['values'][0]['data'];
    columns = columns.map((header, i) => header.replace(/ /g, ''));

    let rows = json['rows'];
    let data = [];

    for (let i=0; i < rows.length; i++) {
        let row = rows[i]['values'][0]['data'];
        let newRow = {};
        // For each of the included fields, format as `column: value` data
        for (let j=0; j < includeFields.length; j++) {
            let field = includeFields[j];
            newRow[field] = row[columns.indexOf(field)];

            // trim extra 0's to convert longest queue time to seconds from ms
            if (field == 'CurrentLongestQueueTime' && newRow[field].length > 3)
                newRow[field] = newRow[field].slice(0, -3);

            // Convert to number if needed in Schema
            if (!QueueStats.schema.paths[field]) {
                log.error(`could not find statistics field ${field}`);
            }
            else if (QueueStats.schema.paths[field].instance == 'Number') {
                newRow[field] = parseInt(newRow[field]);
            }
        }
        data.push(newRow);
    }
    return data;
}



// Calls fun() once database is finished updating
async function onReady(fun) {
    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    let waited = 0;
    while (currentlyUpdatingData && waited < 50000) {
        log.message(`QueueStats.onReady called while database is updating; waiting 1000ms`);
        waited += 1000;
        await wait(1000);
    }
    fun();
}


module.exports.scheduleUpdate = scheduleUpdate;
module.exports.getData = getData;
module.exports.onReady = onReady;
