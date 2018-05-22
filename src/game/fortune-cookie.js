const fetch = require('node-fetch');
const log = require('../utility/log');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fortuneCookieSchema = mongoose.Schema({
    // Owner of cookie
    username: {

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
    // Time created / awarded
    timestamp: {
        type: Date
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

async function getRandomProverb(category) {
    let res = await fetch('http://www.yerkee.com/api/fortune/wisdom');
    let proverb = (await res.json())['fortune'];
    // Replace newline & tab with a space
    return proverb.replace(/\n|\t/g, ' ');
}
module.exports.getRandomProverb = getRandomProverb;


async function remove(id) {
    return FortuneCookie.remove({ _id: id });
}
module.exports.remove = remove;
