const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const logSchema = mongoose.Schema({
    level: {
        type: String,
        default: 'info',
        enum: [
            'error',
            'warn',
            'info',
            'verbose',
            'debug',
            'silly'
        ]
    },
    category: {
        type: String
    },
    message: {
        type: String
    },
    data: Object
});
const Log = mongoose.model('Log', logSchema);


// Utility functions for logging and recording updates
function message(text, level='info', category='misc', data={}) {
    console.log(`[${moment()}] ${text}`);
    Log.create({
        level: level,
        category: category,
        message: text,
        data: data
    }, (err, doc) => {
        if (err) console.error(`[${moment()}] Error while logging message "${text}": ${err}`);
    });
}

// Log to both error and normal log file
function error(text, ...args) {
    console.error(`[${moment()}] ${text}`);
    message(text, 'error', ...args);
}

function info(text, ...args) {
    message(text, 'info', ...args);
}

function debug(text, ...args) {
    message(text, 'debug', ...args);
}

module.exports.message = message;
module.exports.error = error;
module.exports.info = info;
module.exports.debug = debug;
