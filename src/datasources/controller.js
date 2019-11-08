///////////////////////////
// - CONTROL THE DATA -
// This module brings together the various data sources (Five9 and custom models).
//
// Requests from the client can call in the getScorecardStatistics function
// using filters and groupings, using MongoDB-like object syntax.
//
// - LOOKER UPDATING -
// Also included are Looker upload automation functions that fill in the custom
// data table.
//
///////////////////////////
'use strict';
const moment = require('moment-timezone'); // dates/times
const path = require('ramda/src/path');
const assocPath = require('ramda/src/assocPath');
const dissocPath = require('ramda/src/dissocPath');

const log = require('../utility/log'); // recording updates
const looker = require('../utility/looker'); // Looker API
const queue  = require('./queue-stats'); // real-time queue feeds

const custom = require('./custom-upload');
// Five9 models
const models = require('./five9-models'); // data feeds for SL & calls
// Manual Trackers
const sales = require('./sales-tracker');


/**
 * Get statistics from a datasource.
 *
 * @param  {Object} filter for MongoDB
 * @param  {Object} fields to include, in format { sum: ['f1', 'f2',...] }
 * @param  {Array}  groupBy break down / summarize by these fields
 * @return {Promise} resolves to JSON data matching query
 */
async function getScorecardStatistics({ filter, fields, groupBy, source, joinSources }) {
    // Get data model and filter object
    let model = getModelFromSourceName(source);
    let isCustomData = (model === custom.CustomData);
    let cleanFilter = createFilter(filter);

    // Custom models should be filtered for datasource
    if (isCustomData) {
        cleanFilter._datasourceName = {
            $eq: source
        };
    }

    let data;
    // If data is being summarized, use MongoDB's aggregation pipeline
    if (groupBy.length > 0) {
        let aggregation = [
            {
                $match: cleanFilter
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
        data = await model.find(cleanFilter).lean().exec();
    }

    data = mergeIdToData(data);
    let meta = {};

    // Custom sources include some metadata (last updated time)
    if (isCustomData) {
        let ds = await custom.getDatasourceByName(source);
        if (!ds) throw new Error(`Custom data source '${source}' not found!`);
        meta.lastUpdated = ds.lastUpdated;
    }

    // Make any necessary joins (at the application level - NoSQL!)
    if (joinSources && joinSources.length > 0) {
        for (let joinSource of joinSources) {
            let joinStats = await getScorecardStatistics(joinSource);
            data = joinDatasets(data, joinStats.data, joinSource);
        }
    }

    return {
        data: data,
        meta: meta,
    };
}
module.exports.getScorecardStatistics = getScorecardStatistics;


/**
 * Returns `data` updated with field/values from `joinData`. The data sets are
 * joined based on the parameters in `joinDatasource` (specifically `joinOn` and
 * `joinFields`).
 *
 * @param  {Array}  data
 * @param  {Array}  joinData
 * @param  {Object} joinDatasource
 * @return {Array}  `data` with fields joined from `joinData`
 */
function joinDatasets(data, joinData, joinDatasource) {
    let lookup = {};
    function findMatch(dataRow) {
        let idx = joinDatasource.joinOn.map((f) => dataRow[f.parentField]);
        let match = path(idx, lookup);
        // Destroy lookup to prevent duplicated data on join
        lookup = dissocPath(idx, lookup);
        return match;
    }

    for (let row of joinData) {
        let idx = joinDatasource.joinOn.map((f) => row[f.joinField]);
        lookup = assocPath(idx, row, lookup);
    }
    return data.map((d) => {
        let joinedRow = findMatch(d);
        if (!joinedRow) return d;
        for (let field of joinDatasource.joinFields) {
            d[field.newName] = joinedRow[field.originalName];
        }
        return d;
    });
}



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
        case 'QueueStats':
            return queue.QueueStats;
        case 'AcdFeed':
            return models.AcdFeed;
        case 'AgentLogin':
            return models.AgentLogin;
        case 'CallLog':
            return models.CallLog;
        case 'QueueStats':
            return queue.QueueStats;
        case 'ChatData':
            return models.ChatData;
        case 'SalesTracker':
            return sales.SalesTracker;
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
    let filter = Object.keys(obj)
        .filter((key) => key != 'date')
        .map((key) => {
            return { [key]: obj[key] };
        });
    if (obj.date) {
        filter.push({
            date: {
                $gte: moment.utc(obj.date.$gte, 'YYYY-MM-DD[T]HH:mm:ss').toDate(),
                $lt:  moment.utc(obj.date.$lt, 'YYYY-MM-DD[T]HH:mm:ss').toDate()
            }
        });
    }

    // Turn the list of filters into object using $and -- or just an empty ol' object.
    if (filter.length > 0) {
        filter = { $and: filter };
    } else {
        filter = { };
    }

    return filter;
}

// create $group-ings off the fields in the groupBy array
function createGroup(groupBy, fields) {
    // Summarize based on groupBy fields
    let group = {
        _id: groupBy.reduce((result, field) => {
            result[field] = `$${field}`;
            return result;
        }, {})
    };
    // Create accumulators for fields based on type
    // Currently, can only use one type for a given request
    if (fields.sum)
        group = fields.sum.reduce((result, field) => {
            result[field] = { $sum: `$${field}` };
            return result;
        }, group);
    else if (fields.push)
        group = fields.push.reduce((result, field) => {
            result[field] = { $push: `$${field}` };
            return result;
        }, group);
    else if (fields.sumBoolean)
        group = fields.sumBoolean.reduce((result, field) => {
            result[field] = { $sum: { $cond: [`$${field}`, 1, 0] } };
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
    // Get Look authentication token
    let authToken;
    try {
        authToken = await looker.getAuthToken();
    } catch (err) {
        log.error(`Error while retrieving Looker authentication token: ${err}.`);
    }
    // Check each Customer Datasource that is Looker-based, updating from Looker
    let sources = await custom.CustomDatasource.find({ fromLooker: true, active: { $ne: false } })
                                               .lean().exec();
    for (let source of sources) {
        try {
            let raw = await looker.getJsonData(authToken, source.lookerLookId);
            let data = formatFieldNames(raw, source.lookerFieldLookup);
            let clean = data.map(custom.rowParser(source));
            let deleted = await clearOldData(source, clean);
            custom.setDatasourceLastUpdated(source, new Date());
            await custom.CustomData.collection.insertMany(clean);
        } catch (err) {
            log.error(`Error while updating Looker datasource ${source.name}: ${err}`);
        }
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
    return await custom.CustomData.deleteMany({
        $and: [
            { _datasourceName: datasource.name },
            { date: {
                $gte: new Date(dates.min),
                $lte: new Date(dates.max)
            } }
        ]
    })
}
