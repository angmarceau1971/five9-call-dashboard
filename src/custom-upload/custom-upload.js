


const csv = require('csvtojson'); // CSV parsing
const five9 = require('../utility/five9-interface'); // Five9 interface helper functions
const log = require('../utility/log'); // recording updates
const moment = require('moment-timezone'); // dates/times

const secure = require('./secure_settings.js'); // local/secure settings
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


async function createNewTable(tableName) {

}

async function upload(tableName, data) {
    // if data contains headers not yet in table, confirm
}
