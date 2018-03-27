#!/usr/bin/env nodejs
///////////////////////////
// Import libraries
const bodyParser = require('body-parser'); // parse JSON requests
const compression = require('compression'); // compress file to GZIP
const cors = require('cors'); // CORS middleware
const express = require('express');
const favicon = require('serve-favicon');
const helmet = require('helmet'); // security
const moment = require('moment'); // dates/times
const passport = require('passport'); // user authentication
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const pm2 = require('pm2'); // for server restart when requested
const port = parseInt(process.env.PORT, 10) || 3000;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const admin = require('./admin/admin');
const log = require('./utility/log'); // recording updates
const secure = require('./secure_settings.js'); // local/secure settings

///////////////////////////
// Data management
const database = require('./utility/database'); // connection instance to DB
const report = require('./datasources/report'); // data feeds for SL & calls
const queue  = require('./datasources/queue-stats'); // real-time queue feeds
const customers = require('./datasources/customers'); // customer by zip from Looker
const users = require('./authentication/users'); // stores usernames to check auth
const verify = require('./authentication/verify'); // check user permissions


///////////////////////////
// Routes
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/views');


///////////////////////////
// Define the app
const app = express();
// GZIP it up
app.use(compression());
// Add Favicons
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// Allow CORS
app.use(cors());
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON requests
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
// And throw in some security middleware for good measure...
app.use(helmet());

// Passport and session config
var sessionSettings = {
    secret: secure.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // refresh expiration with each request
    store: new MongoStore({ url: secure.MONGODB_URI }),

    cookie: {
        maxAge: 24 * 3600 * 1000 // expire after 1 day
    }
};
if (app.get('env') == 'production') {
    app.set('trust proxy', 2);
    sessionSettings.cookie.secure = true;
}
app.use(session(sessionSettings));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(verify.authenticate));
// TODO: add Accounts module for authentication & authorization mgmt.
passport.serializeUser((user, done) => { done(null, user.username) });
passport.deserializeUser((username, done) => { done(null, {username:username}) });

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// URL Routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);


///////////////////////////
// Fire up the server
///////////////////////////
let timeoutId = null;

const server = app.listen(port, async () => {
    log.info(`Express listening on port ${port} at ${moment()}!`, 'startup');

    try {
        // Set up initial database connection
        database.connect();

        // Update customers database from Looker every 8 hours
        customers.scheduleUpdate(8 * 3600 * 1000);

        // Update queue stats every 15 seconds
        // Five9 stats API has a limit of 500 requests per hour
        //      (1 request every 7.2 seconds).
        queue.scheduleUpdate(15 * 1000);
        // Start updating call database every 5 minutes
        report.scheduleUpdate(5 * 60 * 1000);
        // Update user list every 12 hours
        users.scheduleUpdate(12 * 60 * 60 * 1000);

        // Start admin jobs
        admin.start();

    } catch (err) {
        log.error(`Error occurred on server: ` + err);
    }
});

module.exports = server;
