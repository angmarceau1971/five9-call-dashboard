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


/**
 * Creates basic field list based on fields in Report model.
 * Only for 1st-time creation. Will throw error if FieldList already
 * has items.
 * @return {Promise} resolves to array of fields
 */
async function initializeList(paths, source) {
    return new Promise((resolve, reject) => {
        FieldList.count({}, (err, count) => {
            console.log(`count = ${count}`);
            if (err) reject(err);
            if (count > 0) reject(new Error(`${count} fields already exist.`));
            let fields = Object.keys(paths)
                // Filter for numbers and remove private properties
                .filter((path) => paths[path].instance == 'Number')
                .filter((path) => path[0] != '_')
                .map((path) => {
                    return {
                        fieldName: path,
                        source: source
                    }
                });

            // Add to collection
            FieldList.collection.insert(fields, (err, docs) => {
                if (err) reject(err);
                resolve(docs);
            })
        })
    });
}
module.exports.initializeList = initializeList;
