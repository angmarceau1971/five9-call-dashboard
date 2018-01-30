const log = require('../helpers/log');
const mongoose = require('mongoose');
const report = require('../models/report');

const fieldListSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fieldName: { type: String },
    defaultRefreshRate: { type: Number, default: 0 },
    source: { type: String, default: 'N/A' }
});

const FieldList = mongoose.model('FieldList', fieldListSchema);

async function update(field) {
    return FieldList.replaceOne(
        { 'fieldName': field.name },
        field
    );
}
module.exports.update = update;


async function getFieldList() {
    return await FieldList.find({});
}
module.exports.getFieldList = getFieldList;


async function initializeList() {
    
}
module.exports.initializeList = initializeList;
