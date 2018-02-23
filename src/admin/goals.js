const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const log = require('../utility/log');


const goalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    // Fields to apply goal to
    fields: {
        type: [{
            source: String,
            name: String
        }],
        default: []
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
    return new Promise((resolve, reject) => {
        Goal.find({
            agentGroups: {
                $elemMatch: {
                    $or: agentGroups
                }
            }
        }, (err, docs) => {
            if (err) {
                log.error(err);
                reject(err);
            }
            resolve(docs);
        })
    });
}


async function update(goal) {
    const oid = new mongoose.Types.ObjectId(goal._id);

    log.message(`Updating ${goal.name} to: ${JSON.stringify(goal)}`);
    let response = await Goal.replaceOne(
        { _id: oid },
        goal
    );
    if (response.nModified > 0) {
        log.message(`Field ${goal.name} has been modified.`);
        return response;
    }
    log.message(`No match for goal ID. Adding new goal ${goal.name}.`);
    return Goal.collection.insert(goal);
}
module.exports.update = update;


async function getAll() {
    return await Goal.find({});
}
module.exports.getAll = getAll;

async function remove(goal) {
    log.message(`Deleting goal ${goal.name}.`);
    const oid = new mongoose.Types.ObjectId(goal._id);
    return Goal.find({ _id: oid }).remove();
}
module.exports.remove = remove;
