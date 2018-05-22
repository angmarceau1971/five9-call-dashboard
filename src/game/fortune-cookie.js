const fetch = require('node-fetch');
const log = require('../utility/log');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fortuneCookieSchema = mongoose.Schema({
    // Owner of cookie
    username: {
        type: String,
        required: true
    },
    // Text
    proverb: {
        type: String,
        required: true
    },
    // Has user read it yet?
    read: {
        type: Boolean,
        default: false
    },
    // Image associated with this cookie
    imageUrl: {
        type: String
    },
    // Time created / awarded
    timestamp: {
        type: Date
    },
    // Why was this awarded?
    reason: {
        type: String,
        default: 'Your AHT in April was 8:31 minutes, below the goal of 10:00 minutes!'
    }
});

const FortuneCookie = mongoose.model('FortuneCookie', fortuneCookieSchema);

/**
 * Create a new fortune cookie for @param username in the database.
 * @param  {String} username owner of cookie
 * @return {Promise -> Object} new fortune cookie object
 */
async function add(username) {
    let proverb = await getRandomProverb();
    let cookie = new FortuneCookie({
        username, proverb, timestamp: moment().toDate()
    });
    return FortuneCookie.create(cookie);
}
module.exports.add = add;

/**
 * Get fortune cookies belonging to the given user.
 * @param  {String} username
 * @param  {Boolean} unreadOnly to return only unread fortunes
 * @return {Promise -> [FortuneCookie]}
 */
function get(username, unreadOnly=false) {
    return FortuneCookie.find({ username }).lean().exec();
}
module.exports.get = get;

async function remove(id) {
    return FortuneCookie.remove({ _id: id });
}
module.exports.remove = remove;


/**
 * Retrieve a randomized `proverb` to put in the fortune cookie.
 * @param  {[type]} category not implemented
 * @return {Promise -> String}          proverb
 */
async function getRandomProverb(category) {
    let res = await fetch('http://www.yerkee.com/api/fortune/wisdom');
    let proverb = (await res.json())['fortune'];
    // Replace newline, tab, and double-space with a space
    return proverb.replace(/\n|\t|  /g, ' ');
}
module.exports.getRandomProverb = getRandomProverb;
