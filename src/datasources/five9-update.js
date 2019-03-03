/**
 * Functions to load data from Five9 and store in database.
 */
const csv = require('csvtojson'); // CSV parsing
const five9 = require('../utility/five9-interface'); // Five9 interface helper functions
const log = require('../utility/log'); // recording updates
const skillGroup = require('./skill-group.js');
const moment = require('moment-timezone'); // dates/times
const pt = require('promise-timeout'); // timeout if Five9 doesn't respond

// Five9 models
const models = require('./five9-models');


//////////////////////////////////////////
// Database updating functions
//////////////////////////////////////////
let currentlyUpdatingData = false;

// Update from Five9 every ${interval} seconds
// Returns ID for setTimeout timer
async function scheduleUpdate(interval) {
    currentlyUpdatingData = true;
    const time = {};
    time.start = moment().tz("America/Denver").format('YYYY-MM-DD') + 'T00:00:00';
    time.end   = moment().tz("America/Denver").format('YYYY-MM-DD') + 'T23:59:59';

    // update from Five9
    try {
        await loadData(time);
    } catch (err) {
        log.error(`Error during report.loadData: ${err}.`);
    }

    // Schedule next update
    currentlyUpdatingData = false;
    return setTimeout(() => scheduleUpdate(interval), interval);
}



const headerLookup = {
    // ACD, Call Log, and Text fields
    'SKILL':        'skill',
    'DATE':         'date',
    'Global.strSugarZipCode':   'zipCode',
    'CALLS':        'calls',
    'CALL ID':      'callId',
    'SERVICE LEVEL count':  'serviceLevel',
    'SERVICE LEVEL':    'serviceLevel',
    'ABANDONED':    'abandons',
    'ABANDONED count': 'abandons',
    'AGENT':        'agentUsername',
    'AGENT NAME':   'agentName',
    'AGENT GROUP':  'agentGroup',
    'HANDLE TIME':  'handleTime',
    'TALK TIME': 'talkTime',
    'CONFERENCE TIME':  'conferenceTime',
    'AFTER CALL WORK TIME': 'acwTime',
    'HOLD TIME':    'holdTime',
    'SPEED OF ANSWER':  'speedOfAnswer',
    'TRANSFERS count':  'transfers',
    'CALLS count':  'calls',
    // Agent feed fields
    'NOT READY TIME':   'notReadyTime',
    'REASON CODE':  'reasonCode',
    'LOGIN TIME':   'loginTime',
    'READY TIME':   'readyTime',
    // Chat fields
    'CREATE DATE': 'date',
    'CAMPAIGN': 'skill',
    'QUEUE TIME': 'speedOfAnswer',
    'MEDIA TYPE': 'mediaType',
    'USER': 'agentUsername',
    'SESSION GUID': 'sessionGuid',
    'AFTER CHAT WORK': 'acwTime',
};

/**
 * Returns array with nice field names, from Five9 CSV report header string.
 *
 * Based on fields in `headerLookup` object
 *
 * @param  {String} csvHeaderLine first (header) line of Five9 CSV report
 * @return {Array} field names in form that's in lookup (to match database)
 */
function getHeadersFromCsv(csvHeaderLine) {
    const oldHeaders = csvHeaderLine.split(',');
    // Return updated header from lookup table; if not found, just return the
    // original header.
    return oldHeaders.map((header) => {
        if (headerLookup.hasOwnProperty(header)) {
            return headerLookup[header];
        }
        return header;
    });
}


/**
 * Re-load data to database. This function directly forces the database to
 * be updated in a given time range, as apposed to `scheduleUpdate`, which
 * manages its own start and end times.
 * @param  {Object} time object with 'start' and 'end' values
 *                          in format 'YYYY-MM-DDThh:mm:ss'
 * @return {Promise}
 */
async function loadData(time) {
    return await Promise.all([
        refreshDatabase(time, models.CallLog, 'Dashboard - Data Feed'),
        refreshDatabase(time, models.AcdFeed, 'Dashboard - ACD Feed'),
        refreshDatabase(time, models.AgentLogin, 'Dashboard - Agent Feed'),
        refreshDatabase(time, models.ChatData, 'Dashboard - Chat Data')
    ]);
}


/**
 * Update Five9 data in MongoDB.
 * @param  {Object} time        object with start and end datetimes
 * @param  {Object} reportModel MongoDB model to update
 * @param  {String} reportName  name of Five9 custom report to pull
 * @return {Promise}            resolves when data loads
 */
async function refreshDatabase(time, reportModel, reportName) {
    let csvData;

    // Get CSV data
    // Calls by zips data
    const reportParameters = five9.getParameters('runReport', null,
                        criteriaTimeStart=time.start, criteriaTimeEnd=time.end, reportName);

    // If Five9 times out, respond to pending data requests with last available data
    try {
        csvData = await five9.getReportResults(reportParameters);
    } catch (err) {
        if (err instanceof pt.TimeoutError) {
            log.error('Report: Five9 request timed out. Sending stale data.');
            return new Promise((resolve) => resolve(null));
        }
        throw err;
    }
    const csvHeader = csvData.substr(0, csvData.indexOf('\n'));

    // Parse CSV data into `data` array
    const data = [];
    await new Promise((resolve, reject) => { // wrap in promise to allow await
        csv({ delimiter: ',', headers: getHeadersFromCsv(csvHeader) })
            .fromString(csvData)
            .on('json', (res) => {
                let datum = parseRow(reportModel, res);
                data.push(datum);
            })
            .on('done', () => resolve(data))
            .on('error', reject);
    });

    // Remove today's old data. (Wrapped in Promise to use await)
    await new Promise ((resolve, reject) => {
        reportModel.deleteMany({
            date: {
                $gte: time.start,
                $lte: time.end
            }
        }, (err, success) => {
            if (err) {
                log.error(`Error deleting data in report model: ${err}`);
                reject(err);
            } else {
                resolve(success);
            }
        });
    });

    // Insert the new data
    if (data.length == 0) return;
    return new Promise ((resolve, reject) => {
        reportModel.collection.insertMany(data, (err, docs) => {
            if (err) {
                log.error(`Error inserting data in report model: ${err}`);
                reject(err);
            }
            resolve(docs);
        });
    });
}


/**
 * Takes one row of Five9 data, responds with data formatted for database.
 * @param  {Object} model Mongo collection being updated
 * @param  {Object} row   initial data from Five9 in { field: value } form
 * @return {Object}       formatted data to insert in collection
 */
function parseRow(model, row) {
    // parsed row object
    const p = {};
    let datestring;
    let seconds = (hhMmSs) => moment.duration(hhMmSs).asSeconds();

    // General field handlers
    if (row.skill) {
        p.skill = row.skill;
        p.skillGroup = skillGroup.getSkillGroup(p.skill);
    }

    // Model-specific fields
    if (model == models.CallLog) {
        datestring = row.date + ' ' + row['HALF HOUR'];
        p.serviceLevel = row.serviceLevel * 1;
        p.abandons = row.abandons * 1;
        p.calls = row.calls * 1;

        // Leave only left 5 digits of zip code
        p.zipCode = row.zipCode.substr(0, 5);
    }
    else if (model == models.AcdFeed) {
        datestring = row.date + ' ' + row['QUARTER HOUR'];
        p.agentUsername = row.agentUsername;
        p.agentName = row.agentName;
        p.agentGroup = row.agentGroup;
        p.callId = row.callId;
        p.calls = row.calls * 1;

        p.handleTime = seconds(row.handleTime);
        p.holdTime = seconds(row.holdTime);
        p.talkTime = seconds(row.talkTime) - p.holdTime;
        p.conferenceTime = seconds(row.conferenceTime);
        p.acwTime = seconds(row.acwTime);
        p.speedOfAnswer = seconds(row.speedOfAnswer);

        p.abandons = row.abandons * 1;
        if (p.abandons) {
            p.serviceLevel = 0;
        } else {
            // Within SL if answered within 60 seconds for _COM skills; 120 for others
            let slThreshold = p.skill.substr(p.skill.length - 4) == '_COM'
                            ? 60 : 120;
            p.serviceLevel = p.speedOfAnswer < slThreshold ? 1 : 0;
        }
    }
    else if (model == models.AgentLogin) {
        datestring = row.date;
        p.agentUsername = row.agentUsername;
        p.agentName = row.agentName;
        p.agentGroup = row.agentGroup;
        p.reasonCode = row.reasonCode;
        p.calls = row.calls * 1;
        p.handleTime = seconds(row.handleTime);
        p.loginTime = seconds(row.loginTime);
        p.notReadyTime = seconds(row.notReadyTime);
        p.readyTime = seconds(row.readyTime);
        p.transfers = row.transfers * 1;
    }
    else if (model == models.ChatData) {
        datestring = row.date + ' ' + row['QUARTER HOUR'];
        p.agentUsername = row.agentUsername;
        p.agentName = row.agentName;
        p.agentGroup = row.agentGroup;
        p.chats = 1;
        p.calls = 1;

        p.handleTime = seconds(row.handleTime);
        p.speedOfAnswer = seconds(row.speedOfAnswer);
        p.acwTime = seconds(row.acwTime);
        p.mediaType = row.mediaType;

        p.abandons = row.agentName == '' ? 1 : 0;
        if (p.abandons) {
            p.serviceLevel = 0;
        } else {
            let slThreshold = 120;
            p.serviceLevel = p.speedOfAnswer < slThreshold ? 1 : 0;
        }
    }
    else {
        log.error('report.parseRow called without model!')
    }

    // Shared fields
    p.date = moment.tz(
        datestring, 'YYYY/MM/DD HH:mm',
        'America/Los_Angeles' // Default Five9 report timezone from API
    ).toDate();

    return p;
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
        // log.message(`Report.onReady called while database is updating; waiting 1000ms`);
        waited += 1000;
        await wait(1000);
    }
    return fun();
}


module.exports.getHeadersFromCsv = getHeadersFromCsv;
module.exports.scheduleUpdate = scheduleUpdate;
module.exports.refreshDatabase = refreshDatabase;
module.exports.loadData = loadData;
module.exports.onReady = onReady;
