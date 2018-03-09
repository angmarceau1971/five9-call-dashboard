const moment = require('moment-timezone'); // dates/times

const log = require('../utility/log'); // recording updates
const report = require('./report'); // data feeds for SL & calls
const queue  = require('./queue-stats'); // real-time queue feeds

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
                    ...createFilter(filter)
                ]
            }
        }, {
            $addFields: {
                // Add day field
                dateDay: {
                    '$dateToString': {
                        format: '%Y-%m-%d',
                        date: '$date',
                        timezone: 'America/Denver'
                    }
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
module.exports.getScorecardStatistics = getScorecardStatistics;


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
            return report.AcdFeed;
            break;
        case 'AgentLogin':
            return report.AgentLogin;
            break;
        case 'CallLog':
            return report.CallLog;
            break;
        case 'QueueStats':
            return queue.QueueStats;
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
    if (obj.date) {
        filter.concat({
            date: {
                $gte: moment(obj.date.$gte, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
                $lt:  moment(obj.date.$lt, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
            }
        });
    }
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
