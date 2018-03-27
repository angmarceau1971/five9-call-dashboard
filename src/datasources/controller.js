const moment = require('moment-timezone'); // dates/times

const log = require('../utility/log'); // recording updates
const looker = require('../utility/looker'); // Looker API
const report = require('./report'); // data feeds for SL & calls
const queue  = require('./queue-stats'); // real-time queue feeds

const custom = require('./custom-upload');

/**
 * Get statistics from a datasource.
 *
 * @param  {Object} filter for MongoDB. Requires date.$gte and date.$lt
 * @param  {Object} fields to include, in format { sum: ['f1', 'f2',...] }
 * @param  {Array}  groupBy break down / summarize by these fields
 * @return {Promise} resolves to JSON data matching query
 */
async function getScorecardStatistics({ filter, fields, groupBy, source }) {
    // Get data model and filter object
    let model = getModelFromSourceName(source);
    let isCustomData = (model === custom.CustomData);
    let cleanFilter = createFilter(filter);

    // Custom models should be filtered for datasource
    if (isCustomData) {
        cleanFilter.push({
            _datasourceName: {
                $eq: source
            }
        });
    }

    let data;
    // If data is being summarized, use MongoDB's aggregation pipeline
    if (groupBy.length > 0) {
        let aggregation = [
            {
                $match: {
                    $and: cleanFilter
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
        data = await getStatisticsFrom(model, aggregation);
    // If data isn't being grouped, just return raw matching documents
    } else {
        data = await model.find({ $and: cleanFilter }).lean().exec();
    }

    let finalData = mergeIdToData(data);
    let meta = {};
    if (isCustomData) {
        meta.lastUpdated =
            (await custom.getDatasourceByName(source)).lastUpdated;
    }
    return {
        data: finalData,
        meta: meta
    };
}
module.exports.getScorecardStatistics = getScorecardStatistics;


/**
 * Merge _id fields into each datum. E.g., the input:
 *      [ { calls: 42, _id: { name: 'Frodo' } } ]
 * will return:
 *      [ { calls: 42, name: 'Frodo', _id: { name: 'Frodo' } } ]
 * @param {Array} data from MongoDB
 * @return {Array} data with each entry including _id as regular fields
 */
function mergeIdToData(data) {
    return data.map((datum) => Object.assign(datum, datum._id));
}

/**
 * Used to return model to extract data, and to determine if the model name is a
 * custom field.
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
        // If it's not one of the above sources, assume it's a custom model
        default:
            return custom.CustomData;
    }
}

function isCustomSource(sourceName) {
    return getModelFromSourceName(sourceName) === custom.CustomData;
}
module.exports.isCustomSource = isCustomSource;


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
    if (fields.sum)
        group = fields.sum.reduce((result, field) => {
            result[field] = { $sum: `$${field}` };
            return result;
        }, group);
    if (fields.push)
        group = fields.push.reduce((result, field) => {
            result[field] = { $push: `$${field}` };
            return result;
        }, group);
    return group;
}


async function scheduleLookerUpdates(interval) {
    let authToken = await looker.getAuthToken();
    let sources = await custom.CustomDatasource.find({ fromLooker: true })
                                                .lean().exec();
    for (let source of sources) {
        let raw = await looker.getJsonData(authToken, source.lookerLookId);
        let clean = formatLookerData(raw, source.lookerFieldLookup);

    }
    return setTimeout(() => scheduleLookerUpdates(interval))
}

function formatLookerData(data, fieldLookup) {
    return data.map((d) => {
        let res = {};
        for (let lookerField in fieldLookup) {
            let cleanField = fieldLookup[lookerField];
            res[cleanField] = d[lookerField];
        }
        return res;
    });
}
