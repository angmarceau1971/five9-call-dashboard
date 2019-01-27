const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const log = require('../utility/log');

const linkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // Name to display
    name: {
        type: String
    },
    url: {
        type: String,
        default: ''
    },
    // Agent groups to display link for
    agentGroups: {
        type: [String],
        default: []
    }
});

const Link = mongoose.model('Link', linkSchema);

async function update(link) {
    const oid = new mongoose.Types.ObjectId(link._id);

    log.message(`Updating ${link.name} to: ${JSON.stringify(link)}`);
    let response = await Link.replaceOne(
        { _id: oid },
        link
    );
    if (response.n > 0) {
        log.message(`Link ${link.name} has been modified.`);
        return response;
    }
    log.message(`No match for link ID. Adding new link ${link.name}.`);
    return Link.collection.insertOne(link);
}
module.exports.update = update;


function getAll() {
    return Link.find({}).exec();
}
module.exports.getAll = getAll;

function remove(link) {
    log.message(`Deleting link ${link.name}.`);
    const oid = mongoose.Types.ObjectId(link._id);
    return Link.deleteOne({ _id: oid }).exec();
}
module.exports.remove = remove;
