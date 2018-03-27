/*
** This module pulls Looker data showing number of customers by zip code.
**
 */
const log = require('../utility/log'); // recording updates
const looker = require('./looker'); // Looker API utilities
const moment = require('moment-timezone'); // dates/times
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const secure = require('../secure_settings'); // Looker paths


//////////////////////////////////////////
// MongoDB database definitions
//////////////////////////////////////////
// Schema for report data
const customersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    zipCode: String,
    count: Number
});

//  MongoDB model
const Customers = mongoose.model('Customers', customersSchema);


//////////////////////////////////////////
// Module methods
//////////////////////////////////////////
/**
 * Refresh the Customers table from Looker.
 * @param  {Number} interval in ms to re-run after
 * @return {Promise} Resolves once the Customers table is updated.
 */
async function scheduleUpdate(interval) {
    log.message('Updating Customers database');
    // Authenticate, get data from Looker and format for easy consumption
    let auth = await looker.getAuthToken();
    let rawData = await looker.getJsonData(auth, secure.LOOKER_LOOK_ID);
    let data = format(rawData);

    // Remove old data and add the new
    // Wrapped in Promise for easy awaits in calling function
    await Customers.remove({});
    return new Promise ((resolve, reject) => {
        Customers.collection.insert(data, (err, docs) => {
            // Repeat function after interval
            setTimeout(() => scheduleUpdate(interval), interval);
            if (err) {
                log.error(`Error inserting data in Customers model: ${err}`);
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

async function getData() {
    return await Customers.find({});
}

/**
 * @param  {Object} data JSON from Looker
 * @return {Object}      Data ready to be insterted into database
 */
function format(data) {
    // Remove null zip code and map to database's field names
    return data
        .filter((d) => d[secure.LOOKER_FIELD_ZIP_CODE] != null)
        .map((d) => ({
                'zipCode':       d[secure.LOOKER_FIELD_ZIP_CODE],
                'customerCount': d[secure.LOOKER_FIELD_CUSTOMER_COUNT]
            })
        );
}


module.exports.getData = getData;
module.exports.scheduleUpdate = scheduleUpdate;
module.exports.Customers = Customers;
