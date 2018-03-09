/**
 * This module helps handle manual data uploads via CSV files.
 *
 */

const csv = require('csvtojson'); // CSV parsing
const five9 = require('../utility/five9-interface'); // Five9 interface helper functions
const log = require('../utility/log'); // recording updates
const moment = require('moment-timezone'); // dates/times

const secure = require('../secure_settings.js'); // local/secure settings
const db = require('../utility/database').getMongoDb();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


/**
 * Create a new MongoDB collection.
 * @param  {String} tableName name for new collection
 * @return {Promise}          resolves to new collection
 */
async function createNewTable(tableName) {
    return new Promise((resolve, reject) => {
        db.createCollection(tableName, function (err, collection) {
            if (err) {
                log.error(`custom-upload.createNewTable: ${err}`);
                reject(err);
            }
            resolve(collection);
        });
    });
}

/**
 * Add data to custom collection.
 * @param  {String} tableName collection name
 * @param  {Array}  data      array of new data
 * @param  {Boolean} confirmedNewHeaders true if user has already verified that
 *                                       new headers/fields/columns should be created
 * @return {Promise}          resolves to new documents
 */
async function upload(tableName, data, confirmedNewHeaders) {
    throw new Error('custom upload not implemented');
    // if data contains headers not yet in table, confirm with user
    if (!confirmedNewHeaders && hasNewHeaders(coll, data)) {

    }
}
module.exports.upload = upload;

/**
 * Convert CSV data string into Array of objects.
 * @param  {String} csvString
 * @param  {Function} rowProcessor accepting Object that represents each row for
 *                      additional processing; should return processed Object.
 * @return {Promise} resolves to Array of data
 */
async function parseCsv(csvString, rowProcessor=(x)=>x){
    // Parse CSV data into `data` array
    const data = [];

    return new Promise((resolve, reject) => { // wrap in promise to allow await
        csv({ delimiter: ',' })
            .fromString(csvString)
            .on('json', (res) => {
                let datum
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
