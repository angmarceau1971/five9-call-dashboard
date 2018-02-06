const log = require('../helpers/log');
const mongoose = require('mongoose');

const fieldListSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    defaultRefreshRate: { type: Number, default: 0 },
    source: { type: String, default: 'N/A' },
    format: {
        type: { type: String, default: '' },
        string: { type: String, default: '' }
    },
});

const FieldList = mongoose.model('FieldList', fieldListSchema);

async function update(field) {
    return FieldList.replaceOne(
        { 'name': field.name },
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
    // console.log(paths);
    return new Promise((resolve, reject) => {
        FieldList.count({}, (err, count) => {
            console.log(`count = ${count}`);
            if (err) reject(err);
            // if (count > 0) reject(new Error(`${count} fields already exist.`));
            let fields = Object.keys(paths)
                // Filter for numbers and remove private properties
                .filter((path) => paths[path].instance == 'Number')
                .filter((path) => path[0] != '_')
                .map((path) => {
                    return {
                        name: path,
                        source: source,
                        format: {
                            type: paths[path].instance,
                            string: ''
                        }
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
module.exports.FieldList = FieldList;
