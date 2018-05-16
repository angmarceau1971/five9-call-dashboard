/**
 * Tracker to record manually-entered sales orders made.
 *
 */
'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const log = require('../utility/log');


const salesTracker = mongoose.Schema({
    // User who made sale
    username: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    // Types of sales
    saleType: {
        type: String,
        required: true,
        enum: [
            'NC - New Connect', 'RS - Restart / Reconnect', 'TR - Transfer',
            'UP - Upgrade', 'VO - Video Only'
        ]
    },
    dtvSaleMade: {
        type: Boolean,
        default: false
    },
    // calculated field (added on save) depending on saleType
    saleMade: {
        type: Boolean,
        required: true
    },
}, { // options: timestamp will add 'createdAt' and 'updatedAt' fields
    timestamps: true
});

const SalesTracker = mongoose.model('SalesTracker', salesTracker);
module.exports.SalesTracker = SalesTracker;


/**
 * Save an entry to the tracker.
 * @param {String} username      user who's recording sale
 * @param {String} accountNumber new account number
 * @param {String} saleType
 * @param {Boolean} dtvSaleMade  true if sold
 */
function add(username, accountNumber, saleType, dtvSaleMade) {
    let sale = new SalesTracker({
        username: username, accountNumber: accountNumber,
        saleType: saleType, dtvSaleMade: dtvSaleMade,
        saleMade: isSale(saleType)
    });
    return sale.save();
}
module.exports.add = add;

function get(query) {
    return SalesTracker.find(query).lean().exec();
}
module.exports.get = get;


let commissionableTypes = [
    'NC - New Connect', 'RS - Restart / Reconnect', 'TR - Transfer'
];

/**
 * Returns true if the given type counts as a sale.
 * @param  {String}  saleType
 * @return {Boolean}
 */
function isSale(saleType) {
    return commissionableTypes.includes(saleType);
}
