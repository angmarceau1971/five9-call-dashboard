const clone = require('ramda/src/clone');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const uploader = require('../custom-upload/custom-upload');

const skillGroupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    // Array of skills in this group
    skills: {
        type: Array ,
        default: [String]
    }
});

const SkillGroup = mongoose.model('SkillGroup', skillGroupSchema);
module.exports.SkillGroup = SkillGroup;

/**
 * Replace existing skill groups with new mapping.
 * @param  {Array}  data array of objects with fields `name` and `skills`
 * @return {Promise}     resolves to new documents
 */
async function upload(data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        SkillGroup.remove({}, (err, success) => {
            if (err) reject(`skill-group.upload removal: ${err}`);
            SkillGroup.collection.insert(data, (err, docs) => {
                if (err) reject(`skill-group.upload insertion: ${err}`);
                resolve(docs);
            });
        });
    });
}
module.exports.upload = upload;

async function process(csvString) {
    return uploader.parseCsv(csvString, function parseRow(row) {
        return {
            name: row.name.trim(),
            skills: row.skills.split(';').map((skill) => skill.trim())
        };
    });
}
module.exports.process = process;
