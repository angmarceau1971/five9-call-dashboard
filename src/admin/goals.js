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
    // Agent group(s) to apply goal to
    agentGroups: {
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
 *
 * @param  {Array of Strings} agentGroups
 * @return {Promise -> Array} goals that match any of the agent groups passed in
 */
async function getGoalsForAgentGroups(agentGroups) {
    return (await getAll()).filter((goal) => {
        return (intersection(agentGroups, goal.agentGroups).length > 0);
    });
}
module.exports.getGoalsForAgentGroups = getGoalsForAgentGroups;

async function update(goal) {
    const oid = new mongoose.Types.ObjectId(goal._id);

    log.message(`Updating ${goal.name} to: ${JSON.stringify(goal)}`);
    let response = await Goal.replaceOne(
        { _id: oid },
        goal
    );
    if (response.n > 0) {
        log.message(`Field ${goal.name} has been modified.`);
        return response;
    }
    log.message(`No match for goal ID. Adding new goal ${goal.name}.`);
    return Goal.collection.insert(goal);
}
module.exports.update = update;


function getAll() {
    return Goal.find({}).exec();
}
module.exports.getAll = getAll;

function remove(goal) {
    log.message(`Deleting goal ${goal.name}.`);
    const oid = mongoose.Types.ObjectId(goal._id);
    return Goal.remove({ _id: oid }).exec();
}
module.exports.remove = remove;
