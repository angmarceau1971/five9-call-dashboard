const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fieldListSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    displayName: { type: String, default: '' },
    fullName: { type: String, default: '' },
    defaultRefreshRate: { type: Number, default: 0 },
    source: { type: String, default: 'N/A' },
    format: {
        type: { type: String, default: '' },
        string: { type: String, default: '' }
    },
    calculatedField: { type: Boolean, default: false },
    calculation: { type: String, default: '' }
});

// Name with source. Update when changing or adding new field.
function fullName(field) {
    let fullName;
    if (field.calculatedField) {
        fullName = `Calculated.${field.name}`;
    } else {
        fullName = `${field.source}.${field.name}`;
    }
    return fullName;
}

const FieldList = mongoose.model('FieldList', fieldListSchema);

async function update(field) {
    const oid = new mongoose.Types.ObjectId(field._id);
    field.fullName = fullName(field);

    log.message(`Updating ${field.name} to: ${JSON.stringify(field)}`);
    let response = await FieldList.replaceOne(
        { _id: oid },
        field
    );
    if (response.n > 0) {
        log.message(`Field ${field.name} has been modified.`);
        return response;
    }
    log.message(`No match for field ID. Adding new field ${field.name}.`);
    return FieldList.collection.insertOne(field);
}
module.exports.update = update;


async function getFieldList() {
    return await FieldList.find({});
}
module.exports.getFieldList = getFieldList;

async function remove(field) {
    log.message(`Deleting field ${field.name}.`);
    const oid = mongoose.Types.ObjectId(field._id);
    return FieldList.findOneAndRemove({ _id: oid });
}
module.exports.remove = remove;


/**
 * Creates basic field list based on fields in Report model.
 * Only for 1st-time creation. Will throw error if FieldList already
 * has items.
 * @return {Promise} resolves to array of fields
 */
async function initializeList(paths, source) {
    return new Promise((resolve, reject) => {
        FieldList.find({}, (err, originalFields) => {
            if (err) reject(err);

            let fields = Object.keys(paths)
                // Exclude fields that are already in database
                .filter((path) => {
                    if (!originalFields.find(
                            (f) => f.name == path && f.source == source)) {
                        return true;
                    } else {
                        return false;
                    }
                })
                // Filter for numbers and remove private properties
                .filter((path) => path[0] != '_')
                .map((path) => {
                    return {
                        name: path,
                        source: source,
                        fullName: `${source}.${path}`,
                        format: {
                            type: paths[path].instance,
                            string: ''
                        }
                    }
                });

            // Add to collection
            if (!fields || !fields.length) resolve(null);
            FieldList.collection.insertMany(fields, (err, docs) => {
                if (err) reject(err);
                resolve(docs);
            })
        })
    });
}
module.exports.initializeList = initializeList;
module.exports.FieldList = FieldList;
