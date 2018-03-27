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

/**
 * @param  {String}  sourceName for datasource
 * @return {Boolean} true if datasource is a custom upload or Looker data
 */
function isCustomSource(sourceName) {
    return getModelFromSourceName(sourceName) === custom.CustomData;
}
module.exports.isCustomSource = isCustomSource;

/**
 * Pulls data from @param model based on the given MongoDB @param aggregation
 * pipeline.
 */
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


/////////////////////////////////////////////////////////////////////////////
// Looker-based custom data - Automatic Updating
/////////////////////////////////////////////////////////////////////////////
/**
 * Begin updating Looker-based custom datasources every @param interval
 * milliseconds.
 * @param  {Number} interval in milliseconds
 * @return {Number}          timeout ID for next occurrence
 */
async function scheduleLookerUpdates(interval) {
    log.info(`Updating custom Looker data`);
    let authToken = await looker.getAuthToken();
    let sources = await custom.CustomDatasource.find({ fromLooker: true })
                                                .lean().exec();
    for (let source of sources) {
        let raw = await looker.getJsonData(authToken, source.lookerLookId);
        let data = formatFieldNames(raw, source.lookerFieldLookup);
        let clean = data.map(custom.rowParser(source));
        let deleted = await clearOldData(source, clean);
        custom.CustomData.collection.insert(clean);
    }
    return setTimeout(() => scheduleLookerUpdates(interval), interval);
}
module.exports.scheduleLookerUpdates = scheduleLookerUpdates;

/**
 * Convert data fields from Looker to scorecard names.
 * Any field names not included in @param fieldLookup will be excluded from output.
 * @param  {Array} data        raw export from Looker
 * @param  {Object} fieldLookup lookup for field names from custom datasource
 * @return {Array} data with cleaned-up field names
 */
function formatFieldNames(data, fieldLookup) {
    return data.map((d) => {
        let res = {};
        for (let lookerField in fieldLookup) {
            let cleanField = fieldLookup[lookerField];
            res[cleanField] = d[lookerField];
        }
        return res;
    });
}

/**
 * Delete data in @param datasource within *dates* that are including in the
 * @param newData.
 *
 * @param  {Object} datasource
 * @param  {Array} newData
 * @return {Promise}
 */
async function clearOldData(datasource, newData) {
    // find oldest and newest dates
    let dates = newData.reduce((dates, d) => {
        return {
            min: Math.min(dates.min, d.date),
            max: Math.max(dates.max, d.date)
        };
    }, { min: Infinity, max: -Infinity });
    // delete former data
    return await custom.CustomData.remove({
        $and: [
            { _datasourceName: datasource.name },
            { date: {
                $gte: new Date(dates.min),
                $lte: new Date(dates.max)
            } }
        ]
    })
}
