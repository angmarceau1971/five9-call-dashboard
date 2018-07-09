/**
 * This module helps handle manual data uploads via CSV files.
 *
 * Models included are CustomDatasource, which describes a type of custom data,
 * and CustomData, which houses the actual uploaded data.
 */

const csv = require('csvtojson'); // CSV parsing
const five9 = require('../utility/five9-interface'); // Five9 interface helper functions
const log = require('../utility/log'); // recording updates
const moment = require('moment-timezone'); // dates/times
const uniq = require('ramda/src/uniq');

const secure = require('../secure_settings.js'); // local/secure settings
const db = require('../utility/database').getMongoDb();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


////////////////////////////////////////////////////////////////////////////////
// Custom Datasource manipulation
////////////////////////////////////////////////////////////////////////////////
// Definition for custom datasources
const customDatasourceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        unique: true
    },
    // Array of field objects, each having `name` and `type` properties
    fields: {
        type: [{
            _id: false,
            name: String,
            fieldType: { // this is a property called `type`
                type: String,
                enum: ['Number', 'String', 'Date']
            }
        }],
        default: []
    },
    // When updating, should all data be replaced, or should new data be
    // appended to existing data?
    defaultUpdateType: {
        type: String,
        default: 'addTo',
        enum: ['addTo', 'overwrite']
    },
    // Record when the data was last uploaded
    lastUpdated: {
        type: Date
    },
    // Does this pull from a Looker table?
    fromLooker: {
        type: Boolean,
        default: false
    },
    // ID of Look used
    lookerLookId: {
        type: String
    },
    // object to lookup fields, format: { LookerFieldName: DashboardFieldName }
    lookerFieldLookup: {
        type: Object
    }
});

const CustomDatasource = mongoose.model(
    'CustomDatasource', customDatasourceSchema
);
module.exports.CustomDatasource = CustomDatasource;

// Model to store actual uploaded data
const customDataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // Name of datasource.collectionName associated with this datum
    _datasourceName: {
        type: String,
        required: true
    },
    // Any additional fields are added by custom upload
});

const CustomData = mongoose.model('CustomData', customDataSchema);
module.exports.CustomData = CustomData;


/**
 * Get list of custom datasources
 * @return {Promise -> Array} resolves to array of CustomDatasource objects
 */
function getAll() {
    return CustomDatasource.find({});
}
module.exports.getAll = getAll;
/**
 * Get list of custom datasources
 * @param  {String} datasourceName
 * @return {Promise -> Array} resolves to array of CustomDatasource objects
 */
function getDatasourceByName(datasourceName) {
    return CustomDatasource.findOne({ name: datasourceName }).lean().exec();
}
module.exports.getDatasourceByName = getDatasourceByName;


/**
 * Save custom datasource to table. Will modify entry if it already exists;
 * otherwise, it will add a new datasource.
 * @param  {Object} datasource
 * @return {Promise -> Object}
 */
async function update(datasource) {
    if (datasource._id) {
        const oid = new mongoose.Types.ObjectId(datasource._id);

        log.message(`Updating ${datasource.name} to: ${JSON.stringify(datasource)}`);
        let response = await CustomDatasource.replaceOne(
            { _id: oid },
            datasource
        );
        if (response.n > 0) {
            log.message(`Datasource ${datasource.name} has been modified.`);
            return response;
        }
    }
    // If this datasource doesn't exist, create a new collection for it
    log.message(`No match for datasource ID. Adding new datasource ${datasource.name}.`);
    return CustomDatasource.collection.insert(datasource);
}
module.exports.update = update;

function remove(datasource) {
    log.message(`Deleting datasource ${datasource.name}.`);
    const oid = mongoose.Types.ObjectId(datasource._id);
    return CustomDatasource.remove({ _id: oid }).exec();
}
module.exports.remove = remove;

/**
 * @param  {Object} datasource
 * @param  {Date}   updateTime
 * @return {Promise}
 */
async function setDatasourceLastUpdated(datasource, updateTime) {
    const oid = mongoose.Types.ObjectId(datasource._id);
    return await CustomDatasource.updateOne(
        { _id: oid },
        { $set: { 'lastUpdated': updateTime } }
    );
}
module.exports.setDatasourceLastUpdated = setDatasourceLastUpdated;


////////////////////////////////////////////////////////////////////////////////
// Data updating functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Add data to custom collection.
 * @param  {String} datasourceName name of associated data source
 * @param  {String} csvData    array of new data
 * @param  {String} updateType either 'addTo' or 'overwrite' existing data
 * @return {Promise} resolves to new documents
 */
async function upload(datasourceName, csvData, updateType='addTo') {
    log.info(`Uploading to datasource ${datasourceName}.`);

    if (updateType != 'addTo' && updateType != 'overwrite') {
        throw new Error(`updateType ${updateType} not recognized.`);
    }
    let datasource = await getDatasourceByName(datasourceName);
    if (!datasource) {
        throw new Error(`Datasource ${datasourceName} not found.`);
    }

    // Process data from CSV
    let data = await parseCsv(csvData, rowParser(datasource));

    // if data contains headers not defined in datasource, deny!
    let newFields = nonSchemaFields(datasource, data);
    if (newFields.length > 0) {
        throw new Error(`Uploaded data has a field/header(s) not defined in datasource ${datasourceName}:
                        ${newFields.join(', ')}`);
    }

    // If overwriting existing data, clear it all
    if (updateType == 'overwrite') {
        await CustomData.remove({ _datasourceName: datasourceName });
    }
    // Save it
    setDatasourceLastUpdated(datasource, new Date());
    return CustomData.collection.insert(data);
}
module.exports.upload = upload;

/**
 * Delete data in the given range.
 * @param  {String} datasourceName [description]
 * @param  {String} start   start date/time for removal in YYYY-MM-DD
 * @param  {String} stop    end date/time in YYYY-MM-DD
 * @return {Promise}
 */
async function clear(datasourceName, start, stop) {
    if (!formatIsGood(start))
        throw new Error(`Start date is invalid: ${start}. Should be in YYYY-MM-DD format.`);
    if (!formatIsGood(stop))
        throw new Error(`Stop date is invalid: ${stop}. Should be in YYYY-MM-DD format.`);

    return CustomData.remove({
        _datasourceName: datasourceName,
        date: {
            // Convert to UTC dates
            $gte: new Date(moment.utc(start).format()),
            $lte: new Date(moment.utc(stop) .endOf('day').format())
        }
    });
}
module.exports.clear = clear;

/**
 * Returns a function that takes a row of data, and applies formatting based on
 * the datasource that it rolls into.
 * @param  {Object} datasource that data will be added to
 * @return {Function} function accepting object representing a raw row / document
 */
function rowParser(datasource) {
    let converters = {
        'Number': (x) => x * 1,
        'String': (x) => String(x),
        'Date':   (x) => {
                    if (!formatIsGood(x))
                        throw new Error(`Date value "${x}" isn't in a valid format. Be sure to use YYYY-MM-DD formats only.`);
                    return moment.tz(x, null, 'America/Denver')
                          .toDate();
              }
    };
    let fieldConverter = datasource.fields.reduce((o, field) => {
        o[field.name] = converters[field.fieldType];
        return o;
    }, {});

    return function rowParser(row) {
        for (let field of Object.keys(row)) {
            row[field] = fieldConverter[field](row[field]);
        }
        row._datasourceName = datasource.name;
        return row;
    }
}
module.exports.rowParser = rowParser;

/**
 * Checkes that date matches YYYY-MM-DD format
 * @param  {String} dateString
 * @return {Boolean}
 */
function formatIsGood(dateString) {
    return (
        /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/g.exec(dateString)
        !=
        null
    );
}

/**
 * Check that @param datasource includes all the fields in @param data.
 * Assumes each object in data array has the same keys (as in parsed CSV data).
 * @param  {Object} datasource
 * @param  {Array}  data
 * @return {Array} of fields that aren't in schema
 */
function nonSchemaFields(datasource, data) {
    let fields = [];
    for (let fieldName of Object.keys(data[0])) {
        if (fieldName !== '_datasourceName'
            && datasource.fields
                .filter((field) => field.name == fieldName)
                .length == 0)
            fields.push(fieldName);
    }
    return uniq(fields);
}

/**
 * Convert CSV data string into Array of objects.
 * @param  {String} csvString
 * @param  {Function} rowProcessor should accept an Object that represents a row
 *                      of the data, then return parsed row.
 * @return {Promise} resolves to Array of data
 */
async function parseCsv(csvString, rowProcessor = (x)=>x) {
    // Parse CSV data into `data` array
    const data = [];

    return new Promise((resolve, reject) => { // wrap in promise to allow await
        csv({ delimiter: ',' })
            .fromString(csvString)
            .on('json', (res) => {
                let datum;
                try {
                    datum = rowProcessor(res);
                } catch (err) {
                    reject(new Error(`during CSV processing: ${err}`));
                }
                data.push(datum);
            })
            .on('done', () => resolve(data))
            .on('error', reject);
    });
}
module.exports.parseCsv = parseCsv;
