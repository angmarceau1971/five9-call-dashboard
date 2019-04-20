const clone = require('ramda/src/clone');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const log = require('../utility/log');
const uploader = require('./custom-upload');

const skillGroupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        unique: true
    },
    // Array of skills in this group
    skills: {
        type: [String],
        default: []
    },
    // Agent group(s) who handle this skill group
    agentGroups: {
        type: [String],
        default: []
    }
});

const SkillGroup = mongoose.model('SkillGroup', skillGroupSchema);
module.exports.SkillGroup = SkillGroup;

/**
 * Create cached / in-memory copies of skill lookups for fast retrieval later.
 * @type {Map}
 */
let skillGroupLookup, skillLookup; // <-- ES6 Map objects
/**
 * This is called anytime Express restarts. Should be re-ran when skill groupings
 * change.
 * @return {Promise} resolves when completed
 */
async function generateLookup() {
    log.message('Generating skill group lookup.')
    return new Promise((resolve, reject)  => {
        SkillGroup.find({}, (err, docs) => {
            if (err) reject(err);
            // Create skill group -> skills lookup
            skillGroupLookup = docs.reduce((lookup, skillGroup) => {
                lookup.set(skillGroup.name, skillGroup);
                return lookup;
            }, new Map());
            // Create skill -> skill group lookup
            skillLookup = docs.reduce((lookup, skillGroup) => {
                for (let skill of skillGroup.skills) {
                    lookup.set(skill, skillGroup.name);
                }
                return lookup;
            }, new Map());
            resolve(skillGroupLookup);
        });
    });
}
mongoose.connection.on('connected', generateLookup);

/**
 * Replace existing skill groups with new mapping.
 * @param  {Array}  data array of objects with fields `name` and `skills`
 * @return {Promise}     resolves to new documents
 */
async function upload(data) {
    return new Promise((resolve, reject) => {
        SkillGroup.deleteMany({}, (err, success) => {
            if (err) reject(`skill-group.upload removal: ${err}`);
            SkillGroup.collection.insertMany(data, (err, docs) => {
                if (err) reject(`skill-group.upload insertion: ${err}`);
                generateLookup();
                resolve(docs);
            });
        });
    });
}
module.exports.upload = upload;

/**
 * @param  {String} csvString uploaded data
 * @return {Promise -> Array} array of objects to save to SkillGroup table
 */
async function process(csvString) {
    function lineToArray(str) {
        return str.split(';').map((item) => item.trim());
    }
    return uploader.parseCsv(csvString, function parseRow(row) {
        return {
            name: row.name.trim(),
            skills: lineToArray(row.skills),
            agentGroups: lineToArray(row.agentGroups)
        };
    });
}
module.exports.process = process;

/**
 * Get skills in a given skill group
 * @param  {String or Array} skillGroupName a skill group name or array of names
 * @return {Array}  string skill names
 */
function getSkills(skillGroupName) {
    // If this is just a single group name, return lookup at that name
    if (typeof(skillGroupName) == 'string') {
        let skillGroup = skillGroupLookup.get(skillGroupName);
        if (!skillGroup) {
            throw new Error(`Skill Group name "${skillGroupName}" doesn't exist.`);
        }
        return skillGroup.skills;
    // For an array of names, return skills for each
    } else {
        // flatten into single 1D array with `...` spread operator
        return [].concat(...skillGroupName.map((name) => getSkills(name)));
    }
}
module.exports.getSkills = getSkills;

/**
 * Return skill group that the given skill belongs to
 * @param  {String} skillName Five9 skill name
 * @return {String} parent skill group
 */
function getSkillGroup(skillName) {
    return skillLookup.get(skillName);
}
module.exports.getSkillGroup = getSkillGroup;

/**
 * For the given Agent Group, returns Skill Groups that this team handles.
 * @param  {String} agentGroup to match
 * @return {Objects[]} matching skill group objects
 */
function getFromAgentGroup(agentGroup) {
    return [...skillGroupLookup.entries()]
        .filter(([groupName, skillGroup]) =>
            skillGroup.agentGroups.includes(agentGroup)
        )
        .map(([groupName, skillGroup]) => {
            return {
                name: groupName,
                skills: skillGroup.skills
            }
        });
}
module.exports.getFromAgentGroup = getFromAgentGroup;


/**
 *
 * @return {Promise<Object[]>} all skill group objects
 */
function getAll() {
    return SkillGroup.find({});
}
module.exports.getAll = getAll;


/**
 * @return {Promise<String CSV>}
 */
async function getCsvData() {
    const csvHeaders = 'name,agentGroups,skills';
    const groups = await getAll();
    const csvGroups = groups.map((group) => {
        const agentGroups = group.agentGroups.join(';');
        const skills = group.skills.join('; ');
        return `${group.name},${agentGroups},${skills}`;
    }).join('\n');
    return `${csvHeaders}\n${csvGroups}`;
}
module.exports.getCsvData = getCsvData;
