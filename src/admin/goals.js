const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const log = require('../utility/log');
const intersection = require('ramda/src/intersection');

const goalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    // Field to apply goal to
    field: {
        type: String,
        default: ''
    },
    // Agent group(s) to apply goal to. Empty array means apply to all.
    agentGroups: {
        type: [String],
        default: []
    },
    // Skill group(s) to apply goal to
    skillGroups: {
        type: [String],
        default: []
    },
    // Comparison function symbol (<, >, ==, ...)
    // if comparator is '<' and actual < goalThreshold, actual is a "success"
    comparator: {
        type: String,
        default: '<='
    },
    thresholds: {
        type: [Number],
        default: []
    }
});

const Goal = mongoose.model('Goal', goalSchema);

/**
 * Returns goals that include the passed-in agent groups, or include all agent
 * groups.
 * @param  {Array of Strings} agentGroups
 * @return {Promise -> Array} goals that match any of the agent groups passed in
 */
async function getGoalsForAgentGroups(agentGroups) {
    let appliesToGroups = (goal) => goalIncludesAgentGroups(goal, agentGroups);
    return (await getAll()).filter(appliesToGroups);
}
module.exports.getGoalsForAgentGroups = getGoalsForAgentGroups;

/**
 * True if the given goal applies to the given agent groups
 * @param  {Object} goal
 * @param  {Object} agentGroups
 * @return {Boolean}
 */
function goalIncludesAgentGroups(goal, agentGroups) {
    return (goal.agentGroups.length == 0
            || intersection(agentGroups, goal.agentGroups).length > 0
        );
}

async function update(goal) {
    const oid = new mongoose.Types.ObjectId(goal._id);

    log.message(`Updating ${goal.name} to: ${JSON.stringify(goal)}`);
    let response = await Goal.replaceOne(
        { _id: oid },
        goal
    );
    if (response.n > 0) {
        log.message(`Goal ${goal.name} has been modified.`);
        return response;
    }
    log.message(`No match for goal ID. Adding new goal ${goal.name}.`);
    return Goal.collection.insertOne(goal);
}
module.exports.update = update;


function getAll() {
    return Goal.find({}).exec();
}
module.exports.getAll = getAll;

function remove(goal) {
    log.message(`Deleting goal ${goal.name}.`);
    const oid = mongoose.Types.ObjectId(goal._id);
    return Goal.deleteOne({ _id: oid }).exec();
}
module.exports.remove = remove;
