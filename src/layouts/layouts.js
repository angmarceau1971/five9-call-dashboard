const clone = require('ramda/src/clone');
const intersection = require('ramda/src/intersection');
const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const cardSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        unique: true
    },
    layoutOrder: {
        type: Number
    },
    columns: {
        type: Number,
        default: 1
    },
    widgets: {
        type: [Object],
        default: []
    }
});

const layoutSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    layoutType: {
        type: String,
        enum: ['team', 'individual']
    },
    defaultForAgentGroups: {
        type: [String]
    },
    optionalForAgentGroups: {
        type: [String]
    },
    createdBy: {
        type: String,
        default: null
    },
    // Store card & datasource objects as JSON string, to prevent issues with
    // MongoDB query operators ($in, $or, etc.) being saved to table
    cards: {
        type: String,
        default: '[]'
    },
    datasources: {
        type: String,
        default: '[]'
    },
    sortOrder: {
        type: Number,
        default: Infinity
    },
    // Total number of columns in Dashboard. Usually 4.
    columns: {
        type: Number,
        default: 4
    }
});

layoutSchema.post('find', function(result) {
    let layout = result;
    return result.map((layout) => {
        layout.cards = JSON.parse(layout.cards);
        layout.datasources = JSON.parse(layout.datasources);
        return layout;
    });
});

const Layouts = mongoose.model('Layouts', layoutSchema);

/**
 * Gets layouts for the given agent groups, with the default as the first item
 * @param  {[String]} agentGroups array of group names, or empty array for all
 * @return {[Layouts]}
 */
async function getLayoutsForAgentGroups(agentGroups, type='') {
    let query = {};
    if (type) query = { layoutType: type };
    let layouts = await Layouts.find(query).lean().exec();

    // if team layouts are requested, return all of 'em sorted by relevance
    if (type == 'team') {
        return sort(layouts);
    }

    let defaults = layouts.filter((layout) =>
        intersection(layout.defaultForAgentGroups, agentGroups).length > 0
    );
    let optionals = layouts.filter((layout) =>
        intersection(layout.optionalForAgentGroups, agentGroups).length > 0
    );

    let all = [...defaults, ...optionals];
    if (all.length > 0) return sort(all);
    // default to "Main" layout
    return sort(await Layouts.find({name: "Main"}).lean().exec());
}
module.exports.getLayoutsForAgentGroups = getLayoutsForAgentGroups;

function sort(layouts) {
    return layouts.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
}

async function update(layoutObject) {
    let layout = clone(layoutObject);
    layout.cards = JSON.stringify(layout.cards);
    layout.datasources = JSON.stringify(layout.datasources);
    const oid = new mongoose.Types.ObjectId(layout._id);

    log.message(`Updating ${layout.name} to: ${JSON.stringify(layout)}`);
    let response = await Layouts.replaceOne(
        { _id: oid },
        layout
    );
    if (response.n > 0) {
        log.message(`Layout ${layout.name} has been modified.`);
        return response;
    }
    log.message(`No match for layout ID. Adding new layout ${layout.name}.`);
    return Layouts.collection.insert(layout);
}
module.exports.update = update;


function getAll() {
    return Layouts.find({}).lean().exec();
}
module.exports.getAll = getAll;

function remove(layout) {
    log.message(`Deleting layout ${layout.name}.`);
    const oid = mongoose.Types.ObjectId(layout._id);
    return Layouts.remove({ _id: oid }).exec();
}
module.exports.remove = remove;
