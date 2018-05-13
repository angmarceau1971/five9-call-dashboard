/**
 * Tracker to record manually-entered sales orders made.
 *
 */
'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const log = require('../utility/log');


const salesTracker = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // User who made sale
    username: {
        type: String,
        required: true
    },
    // Was the sale closed?
    saleMade: {
        type: Boolean,
        required: true,
        default: false
    },
    dtvSaleMade: {
        type: Boolean,
        required: true,
        default: false
    }
}, { // options: timestamp will add 'createdAt' and 'updatedAt' fields
    timestamps: true
});

const SalesTracker = mongoose.model('SalesTracker', salesTracker);
module.exports.SalesTracker = SalesTracker;


function add(username, saleMade, dtvSaleMade) {
    let sale = new SalesTracker({
        username, saleMade, dtvSaleMade
    });
    return sale.save();
}
module.exports.add = add;

function get(query) {
    return SalesTracker.find(query).lean().exec();
}
module.exports.get = get;
