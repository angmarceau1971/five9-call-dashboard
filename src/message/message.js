const clone = require('ramda/src/clone');
const intersection = require('ramda/src/intersection');
const log = require('../utility/log');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const messageSchema = mongoose.Schema({
    subject: {
        type: String,
        default: ''
    },
    body: {
        type: String,
        default: ''
    },
    // username of sender
    from: {
        type: String
    },
    // array of recipients' usernames, and if they've read the message
    to: [{
        username: { type: String, required: true },
        hasRead:  { type: Boolean, default: false }
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
    // For messages that are replies, store the parent message's ID
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
});

const Messages = mongoose.model('Messages', messageSchema);

/**
 *
 * @param  {Message} message object with fields subject, body, to, from
 * @return {[type]}         [description]
 */
async function send(message) {
    let newMessage = new Messages(message);
    return Messages.create(newMessage);
}
module.exports.send = send;

/**
 * Get messages sent to user
 * @param  {String} username
 * @return {[Messages]} array of message objects
 */
async function get(username) {
    return Messages.find({ 'to.username': username }).lean().exec();
}
module.exports.get = get;

/**
 * Get messages sent to user that have not yet been read
 * @param  {String} username
 * @return {[Messages]} array of unread messages
 */
async function getUnread(username) {
    return Messages
        .find({ to: { $elemMatch: { username: username, isRead: false } } })
        .lean().exec();
}
module.exports.getUnread = getUnread;

/**
 * Mark a message as read
 * @param  {String} id message object ID
 * @param  {String} username
 * @param  {Boolean} hasRead new `hasRead` value
 */
async function markRead(id, username, hasRead) {
    let oid = new mongoose.Types.ObjectId(id);
    return Messages
        .findOneAndUpdate(
            { _id: oid, "to.username": username },
            { "to.$.hasRead": true },
            (err, docs) => {
                if (err) log.error(`Error while marking message as read: ${err}`);
                log.message(docs);
            }
        ).exec();
}
module.exports.markRead = markRead;
