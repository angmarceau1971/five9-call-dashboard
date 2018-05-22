const log = require('../utility/log');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fortuneCookieSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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

    }
});

const FortuneCookie = mongoose.model('FortuneCookie', fortuneCookieSchema);
