const log = require('./log'); // recording updates
const secure = require('../secure_settings.js'); // local/secure settings
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * Create initial connection to database
 */
function connect() {
    // Connect and reconnect if disconnected.
    let connect = async () => {
        await mongoose.connect(secure.MONGODB_URI, {
           keepAlive: 1000,
           connectTimeoutMS: 10000,
           reconnectTries: Number.MAX_VALUE,
           // settings to prevent deprecation warnings
           useNewUrlParser: true,
           useFindAndModify: false,
        });
    };
    connect();
    mongoose.connection.on('disconnected', () => {
        log.error('DB Disconnected: reconnecting.');
        setTimeout(connect, 3000);
    });
}
module.exports.connect = connect;

/**
 * Get an instance of the MongoDB `db` object
 * TODO: is this broken?
 * @return {Object} db connection object
 */
function getMongoDb() {
    return mongoose.connection.db;
}
module.exports.getMongoDb = getMongoDb;
