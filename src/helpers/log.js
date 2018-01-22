const moment = require('moment');

// Utility functions for logging and recording updates
function message(text) {
    console.log(`[${moment()}] ${text}`);
}

// Log to both error and normal log file
function error(text) {
    console.error(`[${moment()}] ${text}`);
    message(text);
}

module.exports.message = message;
module.exports.error = error;
