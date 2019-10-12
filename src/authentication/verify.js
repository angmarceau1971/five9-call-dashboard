/*
** Helpers to authenticate users before returning data to them.
**
** Includes login strategy for Passport as well as route middleware.
*/

const five9 = require('../utility/five9-interface');
const log = require('../utility/log');
const users = require('./users');
const datasource = require('../datasources/controller');
const secure_settings = require('../secure_settings.js');

let basePage = secure_settings.BASE_URL;
if (process.env.NODE_ENV !== 'production') {
    basePage = 'localhost:3000';
}

/**
 * Middleware for page view routes. Redirects to login page if not logged in.
 * @param  {String}  [level='basic'] does this route require `basic`, `supervisor`, `admin` rights?
 * @return {Function}                middleware function
 */
function isLoggedIn(level='basic') {
    return async function(req, res, next) {
        if (req.user) users.updateLastActive(req.user.username);
        if (await isAllowed(level, req)) {
            return next();
        }
        // If not logged in, send user to login page, then redirect back to the
        // original page.
        req.session.returnTo = `${basePage}${req.originalUrl}`;
        res.redirect('login');
    };
}
module.exports.isLoggedIn = isLoggedIn;


/**
 * Middleware for API routes. Return error response if not authenticated.
 * @param  {String} [level='basic'] 'basic' or 'admin'
 * @return {Function}                Express middleware function
 */
function apiMiddleware(level='basic') {
    return async function (req, res, next) {
        if (req.user) users.updateLastActive(req.user.username);
        if (await isAllowed(level, req)) {
            return next();
        }
        res.set('Content-Type', 'application/text');
        res.status(401).send('Could not authenticate your user.');
    }
}
module.exports.apiMiddleware = apiMiddleware;

/**
 * Check if logged-in user should have access of the given level.
 * @param  {String}          level `basic` or `admin`
 * @param  {Express request} req
 * @return {Boolean}       true if user has access; otherwise false
 */
async function isAllowed(level, req) {
    const isAuthenticated = req.isAuthenticated();
    if (isAuthenticated) {
        if (level == 'basic') {
            return true;
        }
        if (level == 'supervisor') {
            if ((await users.isSupervisor(req.user.username))
             || (await users.isAdmin(req.user.username))) {
                 return true;
            }
        }
        if (level == 'admin' && (await users.isAdmin(req.user.username)) == true) {
            return true;
        }
    }
    return false;
}

/**
 * Middleware that enforces custom data must be filtered for current user,
 * unless user is an admin or supervisor.
 * @return {Function} middleware function
 */
function userAccess() {
    return async function(req, res, next) {
        // Allow access if request isn't sensitive (only contains custom data for
        // current user)
        // It's a sensitive request, and the user isn't an admin or supervisor
        let needsToBeSup = false;
        for (let params of req.body) {
            if (await couldBeSensitive(params, req.user.username)) {
                needsToBeSup = true;
            }
        }
        if (!needsToBeSup) {
            return next();
        }

        // Let supervisor and admin users access everything
        if (await users.isSupervisor(req.user.username) ||
            await users.isAdmin(req.user.username)) {
                return next();
        }

        // Failed the test: Log the full request body as a string
        log.error(`Access to data forbidden for ${req.user.username}'s request'.`,
                  'forbidden', JSON.stringify(req.body));
        res.set('Content-Type', 'application/text');
        res.status(403).send('Could not allow access to requested resource. Sorry!');
    }
}
module.exports.userAccess = userAccess;

/**
 * True if datasource is custom and response isn't filtered for the current user
 * @param  {Object} req Express request object
 * @return {Boolean}    might be sensitive
 */
async function couldBeSensitive(params, username) {
    if (!datasource.isCustomSource(params.source)) return false;

    function onlyForAgent(query, criteria) {
        try {
            let filt = query.$in;
            if (filt[0] == criteria && filt.length == 1) return true;
            return false;
        } catch (err) {
            return false;
        }
    }

    if (onlyForAgent(params.filter.agentUsername, username)) {
        return false;
    }
    try {
        let fullName = await users.getFullName(username);
        if (onlyForAgent(params.filter.agentName, fullName)) {
            return false;
        }
    } catch (err) {
        log.error(`during verify.couldBeSensitive: ${err}`);
    }
    return true;
}
module.exports.couldBeSensitive = couldBeSensitive;


/**
 * Passport authentication strategy.
 * @param  {String}   username for Five9
 * @param  {String}   password for Five9
 * @param  {Function} done     from Passport
 * @return {Function}          calls @param done to continue Passport process
 */
async function authenticate(username, password, done) {
    try {
        if (!(await hasPermission(username, password))) {
            log.error(`User ${username} was not authenticated successfully.`);
            return done(null, false, { message: 'Invalid username or password.' });
        }
        // User is good to go
        else {
            log.message(`User ${username} was authenticated successfully.`);
            return done(null, { username: username });
        }
    } catch (err) {
        return done(err);
    }
}
module.exports.authenticate = authenticate;


/**
 * See if user is authorized before assigning Passport auth token.
 * @param  {String}  username
 * @param  {String}  password
 * @return {Boolean} true if credentials fit active Five9 login; otherwise false
 */
async function hasPermission(username, password) {
    if (!username || !password) return false;

    // Is this an active user in our Five9 instance? If not, no go.
    let activeUser = await users.isActive(username);
    if (!activeUser) {
        log.error(`User ${username} not found in database as active user`);
        return false;
    }
    // See if user credentials are good via Five9's API
    else if ((await five9.agentAuthLogin(username, password)) == true) {
        return true;
    }
    // Otherwise, you shall not pass!
    else {
        return false;
    }
}
