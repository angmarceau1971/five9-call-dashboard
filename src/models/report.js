/*
** Intermediate storage of Five9 data in MongoDB, to allow data cacheing and
** reduce the number of direct Five9 API requests / licenses required.
**
*/

const csv = require('csvtojson'); // CSV parsing
const five9 = require('../utility/five9-interface'); // Five9 interface helper functions
const log = require('../utility/log'); // recording updates
const moment = require('moment-timezone'); // dates/times
const pt = require('promise-timeout'); // timeout if Five9 doesn't respond

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for call log report data
const callLogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    skill: String,
    zipCode: String,
    date: Date, // Date and time
    calls: { type: Number, default: 0 },
    serviceLevel: { type: Number, default: 0 },
    abandons: { type: Number, default: 0 }
});
// Schema for ACD queue report data
const acdFeedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    agentUsername: String,
    agentName: String,
    agentGroup: String,
    callId: Number,
    skill: String,
    date: Date, // Date and time
    calls: { type: Number, default: 0 },
    // duration-based fields are stored as seconds
    handleTime: Number,
    holdTime: Number,
    conferenceTime: Number,
    acwTime: Number,
    speedOfAnswer: Number,
    abandons: Number,
    serviceLevel: { type: Number, default: 0 }
});
// Schema for agent login data
const agentLoginSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    agentUsername: String,
    agentName: String,
    agentGroup: String,
    date: Date, // Date and time
    reasonCode: { type: String, default: '' },
    // duration-based fields stored as seconds
    loginTime: Number,
    notReadyTime: Number,
    readyTime: Number,
    handleTime: Number,
    calls: { type: Number, default: 0 },
    transfers: { type: Number, default: 0 }
});


// Models to represent report data
const CallLog = mongoose.model('CallLog', callLogSchema);
const AcdFeed  = mongoose.model('AcdFeed',  acdFeedSchema);
const AgentLogin = mongoose.model('AgentLogin', agentLoginSchema);


/**
 * Returns array with nice field names, from Five9 CSV report header string.
 * @param  {String} csvHeaderLine first (header) line of Five9 CSV report
 * @return {Array} field names in form that's in lookup (to match database)
 */
const headerLookup = {
    // ACD and Call Log fields
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
    'CONFERENCE TIME':  'conferenceTime',
    'AFTER CALL WORK TIME': 'acwTime',
    'SPEED OF ANSWER':  'speedOfAnswer',
    'HOLD TIME':    'holdTime',
    'TRANSFERS count':  'transfers',
    'CALLS count':  'calls',
    // Agent feed fields
    'NOT READY TIME':   'notReadyTime',
    'REASON CODE':  'reasonCode',
    'LOGIN TIME':   'loginTime',
    'READY TIME':   'readyTime',

};
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


//////////////////////////////////////////
// Database updating and access functions
//////////////////////////////////////////
let currentlyUpdatingData = false;

// Update from Five9 every ${interval} seconds
// Returns ID for setTimeout timer
async function scheduleUpdate(interval) {
    currentlyUpdatingData = true;
    const time = {};
    time.start = moment().format('YYYY-MM-DD') + 'T00:00:00';
    time.end   = moment().format('YYYY-MM-DD') + 'T23:59:59';

    // update from Five9
    await loadData(time);

    // Schedule next update
    currentlyUpdatingData = false;
    return setTimeout(() => scheduleUpdate(interval), interval);
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
        refreshDatabase(time, CallLog, 'Dashboard - Data Feed'),
        refreshDatabase(time, AcdFeed, 'Dashboard - ACD Feed'),
        refreshDatabase(time, AgentLogin, 'Dashboard - Agent Feed')
    ]);
}


/**
 * Get agent statistics from the ACD Queue data source.
 *
 * @param  {Object} filter for MongoDB. Requires date.$gte and date.$lt
 * @param  {Object} fields to include, in format { sum: ['f1', 'f2',...] }
 * @param  {Array}  groupBy break down / summarize by these fields
 * @return {Promise} resolves to JSON data matching query
 */
async function getScorecardStatistics({ filter, fields, groupBy, source }) {
    // Construct MongoDB aggregation object
    const aggregation = [
        {
            $match: {
                $and: [
                    {
                        date: {
                            $gte: moment(filter.date.$gte, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
                            $lt:  moment(filter.date.$lt, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
                        }
                    },
                    ...createFilter(filter)
                ]
            }
        }, {
            $addFields: {
                dateDay: {
                    '$dateToString': { format: '%Y-%m-%d', date: '$date' }
                }
            }
        }, {
            $group: createGroup(groupBy, fields)
        }
    ];

    let model = getModelFromSourceName(source);
    let data = await getStatisticsFrom(model, aggregation);
    return mergeIdToData(data);
}
/**
 * Merge _id fields into each datum. E.g., the input:
 *      [ { calls: 1, _id: { name: 'Frodo' } } ]
 * will return:
 *      [ { calls: 1, name: 'Frodo', _id: { name: 'Frodo ' } } ]
 * @param {Array} data from MongoDB
 * @return {Array} data with each entry including _id as regular fields
 */
function mergeIdToData(data) {
    return data.map((datum) => Object.assign(datum, datum._id));
}

/**
 *
 * @param  {String} sourceName
 * @return {Mongoose Model} model associated with name
 */
function getModelFromSourceName(sourceName) {
    switch (sourceName) {
        case 'AcdFeed':
            return AcdFeed;
            break;
        case 'AgentLogin':
            return AgentLogin;
            break;
        case 'CallLog':
            return CallLog;
            break;
        default:
            throw new Error(`Source name "${sourceName}" isn't a valid model.`);
    }
}


async function getStatisticsFrom(model, aggregation) {
    return new Promise((resolve, reject) => {
        model.aggregate(aggregation, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

// transform filter object into MongoDB-style $match
function createFilter(obj) {
    // remove dates - parsed separately
    const filter = Object.keys(obj)
        .filter((key) => key != 'date')
        .map((key) => {
                return { [key]: obj[key] };
            });
    return filter;
}

// create $group-ings off the fields in the groupBy array
function createGroup(groupBy, fields) {
    let group = {
        _id: groupBy.reduce((result, field) => {
                result[field] = `$${field}`;
                return result;
            }, {})
    };
    group = fields.sum.reduce((result, field) => {
        result[field] = { $sum: `$${field}` };
        return result;
    }, group);
    return group;
}




// Summarize call and service level data by skill. Params should give start
// and end time for data.
async function getServiceLevelData(params) {
    return new Promise((resolve, reject) => {
        CallLog.aggregate([
            // Filter for the selected date and skills
            { $match:
                { date: {
                    $gte: moment(params.start, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
                    $lte: moment(params.end, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
                } }
            },
            // Summarize by skill
            { $group: {
                _id: '$skill',
                calls: { $sum: '$calls' },
                serviceLevel: { $sum: '$serviceLevel' },
                abandons: { $sum: '$abandons' }
            } },
            { $project: { // name key as `skill` instead of `_id`
                _id: 0,
                skill: '$_id',
                calls: '$calls',
                serviceLevel: '$serviceLevel',
                abandons: '$abandons'
            } }
        // Respond with the data
        ], (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

// Summarize data by zip code. Params should give start time, end time, and
// skills to filter for.
async function getZipCodeData(params) {
    // Filter for matching (case-insensitive) skill names
    let skillFilter = params.skills.split(',').map((skillName) => {
        return { 'skill': { '$regex': skillName.trim(), '$options': 'i' } };
    });

    return new Promise((resolve, reject) => {
        CallLog.aggregate( [
            // Filter for the selected date and skills
            { $match: { $and: [
                { date: {
                    $gte: moment(params.start, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
                    $lte: moment(params.end, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
                } }, //date
                { $or: skillFilter } // skills
            ] } },
            // Summarize by zip code
            { $group: {
                _id: '$zipCode',
                calls: { $sum: '$calls' }
            } },
            { $project: { // name key as `zipCode` instead of `_id`
                _id: 0,
                zipCode: '$_id',
                calls: '$calls'
            } }
        // Respond with the data
        ], (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    });
}

// Get all report data within timeFilter.start and timeFilter.stop
async function getData(timeFilter, reportModel) {
    const results = await reportModel.find({
        date: {
            $gte: moment(timeFilter.start, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
            $lte: moment(timeFilter.end, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
        }
    });
    return results;
}


/**
 * Update Five9 data in MongoDB.
 * @param  {Object} time        object with start and end datetimes
 * @param  {Object} reportModel MongoDB model to update
 * @param  {String} reportName  name of Five9 custom report to pull
 * @return {Promise}            resolves when data loads
 */
async function refreshDatabase(time, reportModel, reportName) {
    log.message(`Updating Report database with ${reportName}`);
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
        reportModel.remove({
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
        reportModel.collection.insert(data, (err, docs) => {
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
    let datestring;
    const parsed = {};
    let seconds = (hhMmSs) => moment.duration(hhMmSs).asSeconds();

    if (model == CallLog) {
        datestring = row.date + ' ' + row['HALF HOUR'];
        parsed.serviceLevel = row.serviceLevel * 1;
        parsed.abandons = row.abandons * 1;

        // Leave only left 5 digits of zip code
        parsed.zipCode = row.zipCode.substr(0, 5);
        // Set interval in Date format
        parsed.skill = row.skill;
    }
    else if (model == AcdFeed) {
        datestring = row.date + ' ' + row['QUARTER HOUR'];
        parsed.agentUsername = row.agentUsername;
        parsed.agentName = row.agentName;
        parsed.agentGroup = row.agentGroup;
        parsed.callId = row.callId;

        parsed.handleTime = seconds(row.handleTime);
        parsed.holdTime = seconds(row.holdTime);
        parsed.conferenceTime = seconds(row.conferenceTime);
        parsed.acwTime = seconds(row.acwTime);
        parsed.speedOfAnswer = seconds(row.speedOfAnswer);
        parsed.skill = row.skill;

        parsed.abandons = row.abandons * 1;
        parsed.serviceLevel = row.serviceLevel * 1;
    }
    else if (model == AgentLogin) {
        datestring = row.date;
        parsed.agentUsername = row.agentUsername;
        parsed.agentName = row.agentName;
        parsed.agentGroup = row.agentGroup;
        parsed.reasonCode = row.reasonCode;
        parsed.handleTime = seconds(row.handleTime);
        parsed.loginTime = seconds(row.loginTime);
        parsed.notReadyTime = seconds(row.notReadyTime);
        parsed.readyTime = seconds(row.readyTime);
        parsed.transfers = row.transfers * 1;
    }
    else {
        log.error('report.parseRow called without model!')
    }

    // Shared fields
    parsed.calls = row.calls * 1;
    parsed.date = moment.tz(
        moment(datestring, 'YYYY/MM/DD HH:mm'),
        'America/Los_Angeles'
    ).toDate();

    return parsed;
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
        log.message(`Report.onReady called while database is updating; waiting 1000ms`);
        waited += 1000;
        await wait(1000);
    }
    fun();
}


module.exports.getHeadersFromCsv = getHeadersFromCsv;
module.exports.onReady = onReady;
module.exports.scheduleUpdate = scheduleUpdate;
module.exports.getServiceLevelData = getServiceLevelData;
module.exports.getZipCodeData = getZipCodeData;
module.exports.getScorecardStatistics = getScorecardStatistics;
module.exports.CallLog = CallLog;
module.exports.refreshDatabase = refreshDatabase;
module.exports.loadData = loadData;
module.exports.acdFeedSchema = acdFeedSchema;
module.exports.callLogSchema = callLogSchema;
