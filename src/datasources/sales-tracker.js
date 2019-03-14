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
    // optional account number
    accountNumber: {
        type: String,
        required: false
    },
    // Types of sales
    saleType: {
        type: String,
        required: true,
        enum: [
            'NC - New Connect', 'RS - Restart / Reconnect', 'TR - Transfer',
            'UP - Upgrade', 'VO - Video Only', 'Reseller'
        ]
    },
    dtvSaleMade: {
        type: Boolean,
        default: false
    },
    viasatSaleMade: {
        type: Boolean,
        default: false,
    },
    voipSaleMade: {
        type: Boolean,
        default: false,
    },
    // calculated field (added on save) depending on saleType
    saleMade: {
        type: Boolean,
        required: true
    },
    // when was the order tracked?
    date: {
        type: Date,
        required: true
    }
});

const SalesTracker = mongoose.model('SalesTracker', salesTracker);
module.exports.SalesTracker = SalesTracker;


/**
 * Messages sent to agents after successful sales
 */
const saleMessageSchema = mongoose.Schema({
    message: {
        type: String,
        required: true,
    }
});
const SaleMessage = mongoose.model('SaleMessage', saleMessageSchema);


/**
 * Save an entry to the tracker.
 * @param {String} username      user who's recording sale
 * @param {String} accountNumber new account number
 * @param {String} saleType
 * @param {Boolean} dtvSaleMade     true if sold
 * @param {Boolean} viasatSaleMade  true if sold
 * @param {Boolean} voipSaleMade    true if sold
 */
function add(
    username, accountNumber, saleType, dtvSaleMade, viasatSaleMade, voipSaleMade,
) {
    let sale = new SalesTracker({
        username: username, accountNumber: accountNumber,
        saleType: saleType, dtvSaleMade: dtvSaleMade,
        viasatSaleMade: viasatSaleMade,
        voipSaleMade: voipSaleMade,
        saleMade: isSale(saleType),
        date: new Date()
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

/**
 * Return a randomly selected sale message
 * @return {Promise<String>}
 */
async function saleMessage() {
    let messages = await SaleMessage.aggregate([
        { $sample: { size: 1 } }
    ]).exec();

    if (messages.length === 0) {
        return '';
    }
    return messages[0].message;
}
module.exports.saleMessage = saleMessage;



//////////////////////////////////////
// Sale Message updating functionality

async function updateMessage(message) {
    const oid = new mongoose.Types.ObjectId(message._id);

    log.message(`Updating ${message.name} to: ${JSON.stringify(message)}`);
    let response = await SaleMessage.replaceOne(
        { _id: oid },
        message
    );
    if (response.n > 0) {
        log.message(`SaleMessage ${message.name} has been modified.`);
        return response;
    }
    log.message(`No match for message ID. Adding new message ${message.name}.`);
    return SaleMessage.collection.insertOne(message);
}
module.exports.updateMessage = updateMessage;


function getAllMessages() {
    return SaleMessage.find({}).exec();
}
module.exports.getAllMessages = getAllMessages;

function removeMessage(message) {
    log.message(`Deleting message ${message.name}.`);
    const oid = mongoose.Types.ObjectId(message._id);
    return SaleMessage.deleteOne({ _id: oid }).exec();
}
module.exports.removeMessage = removeMessage;

