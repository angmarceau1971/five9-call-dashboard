/*
** Intermediate storage of Five9 data in MongoDB, to allow data cacheing and
** reduce the number of direct Five9 API requests / licenses required.
**
*/
const log = require('../utility/log'); // recording updates
const moment = require('moment-timezone'); // dates/times
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for call log report data
const callLogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    callId: String,
    callType: String,
    skill: String,
    skillGroup: String, // calculated via lookup from skill
    zipCode: String,
    date: Date, // Date and time
    calls: { type: Number, default: 0 },
    // number of calls answered within SL
    serviceLevel: { type: Number, default: 0 },
    abandons: { type: Number, default: 0 }
});
// Schema for ACD queue report data
const acdFeedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    callId: String,
    agentUsername: String,
    agentName: String,
    agentGroup: String,
    skill: String,
    skillGroup: String, // calculated via lookup from skill
    date: Date, // Date and time
    calls: { type: Number, default: 0 },
    // duration-based fields are stored as seconds
    handleTime: Number,
    holdTime: Number,
    conferenceTime: Number,
    talkTime: Number,
    acwTime: Number,
    speedOfAnswer: Number,
    abandons: Number,
    // number of calls answered within SL
    serviceLevel: { type: Number, default: 0 },
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
// Schema for Chat + Email data
const chatDataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sessionGuid: String,
    agentUsername: String,
    agentName: String,
    agentGroup: String,
    skill: String, // text "campaign" in Five9
    skillGroup: String, // calculated via lookup from skill
    date: Date, // Date and time
    chats: { type: Number, default: 0 }, // chat count
    calls: { type: Number, default: 0 }, // chat count - named calls for consistency in calculated fields
    // duration-based fields are stored as seconds
    handleTime: Number,
    speedOfAnswer: Number,
    abandons: Number,
    // number of chats answered within SL
    serviceLevel: { type: Number, default: 0 },
    mediaType: String,
    // after chat work / ACW
    acwTime: Number,
});


// Models to represent report data
const CallLog = mongoose.model('CallLog', callLogSchema);
const AcdFeed  = mongoose.model('AcdFeed',  acdFeedSchema);
const ChatData = mongoose.model('ChatData', chatDataSchema);
const AgentLogin = mongoose.model('AgentLogin', agentLoginSchema);


//////////////////////////////////////////
// Data retrieval functions
//////////////////////////////////////////

// Summarize call and service level data by skill. Params should give start
// and end time for data.
async function getServiceLevelData(params) {
    return new Promise((resolve, reject) => {
        AcdFeed.aggregate([
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
                { $or: skillFilter }, // skills
                { callType: { $ne: 'Queue Callback' } },
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

// Returns the last time the user was logged in (last login timestamp + login time)
async function getLastLoggedInTime(username) {
    const logins = await AgentLogin.find({
        agentUsername: username,
    }).sort({ date: -1 }).limit(1);

    if (logins.length === 0) {
        return null
    }
    const login = logins[0]
    return new Date(login.date.getTime() + login.loginTime*1000);
}

/**
 * Maps to the values of the CALL TYPE field in Call Log
 */
module.exports.Five9CallType = {
    QUEUE_CALLBACK: 'Queue Callback',
}


module.exports.CallLog = CallLog;
module.exports.AcdFeed = AcdFeed;
module.exports.AgentLogin = AgentLogin;
module.exports.ChatData = ChatData;

module.exports.acdFeedSchema = acdFeedSchema;
module.exports.callLogSchema = callLogSchema;
module.exports.agentLoginSchema = agentLoginSchema;
module.exports.chatDataSchema = chatDataSchema;

module.exports.getServiceLevelData = getServiceLevelData;
module.exports.getZipCodeData = getZipCodeData;
module.exports.getLastLoggedInTime = getLastLoggedInTime;
