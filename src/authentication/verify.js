/*
** Helpers to authenticate users before returning data to them.
**
** Includes login strategy for Passport as well as route middleware.
*/

const five9 = require('../helpers/five9-interface');
const log = require('../helpers/log');
const users = require('./users');


/**
 * Middleware for page view routes. Redirects to login page if not logged in.
 * @param  {String}  [level='basic'] does this route require `basic` or `admin` rights?
 * @return {Function}                middleware function
 */
function isLoggedIn(level='basic') {
    return async function(req, res, next) {
        if (await isAllowed(level, req)) {
            return next();
        }
        // If not logged in, send user to login page, then redirect back to the
        // original page.
        req.session.returnTo = req.url;
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
        if (level == 'admin' && (await users.isAdmin(req.user.username)) == true) {
            return true;
        }
    }
    return false;
}


/**
 * Passport authentication strategy.
 * @param  {String}   username for Five9
 * @param  {String}   password for Five9
 * @param  {Function} done     from Passport
 * @return {Function}          calls @param done to continue Passport process
 */
async function authenticate(username, password, done) {
    let auth = getAuthString(username, password);
    try {
        if (!(await hasPermission(auth))) {
            return done(null, false, { message: 'Invalid username or password.' });
        }
        // User is good to go
        else {
            return done(null, { username: username });
        }
    } catch (err) {
        return done(err);
    }
}
module.exports.authenticate = authenticate;


/**
 * See if user is authorized before assigning Passport auth token.
 * @param  {String}  auth base64 encoded 'username:password' string
 * @return {Boolean}      true if credentials fit active Five9 login; otherwise false
 */
async function hasPermission(auth) {
    if (!auth) return false;

    // Log this username
    const decoded = Buffer.from(auth, 'base64').toString();
    const username = decoded.split(':')[0];

    // Is this an active user in our Five9 instance? If not, no go.
    let activeUser = await users.isActive(username);
    if (!activeUser) {
        log.error(`User ${username} not found in database as active user`);
        return false;
    }

    // Create a statistics request with these credentials
    const params = { 'service': 'getMyPermissions' };
    const requestMessage = five9.jsonToSOAP(params, 'statistics');
    let response;
    try {
        response = await five9.sendRequest(requestMessage, auth, 'statistics');
    } catch (err) {
        log.error(`Error during Five9 authentication: ${err}`);
        return false;
    }

    // If server responded with success, we're good
    if (response.statusCode == 200) {
        return true;
    }
    // If Five9 server was able to authenticate user but the user just doesn't
    // have a session open, they're good.
    if (response.statusCode == 500 && response.body.search('Session was closed') > -1) {
        return true;
    }
    // Otherwise, you shall not pass!
    log.error(`User ${username} not authenticated successfully`);
    return false;
}
module.exports.hasPermission = hasPermission;


// Combines username and password, then encodes in Base 64. Yum!
function getAuthString(username, password) {
   let auth = username + ':' + password;
   return Buffer.from(auth).toString('base64');
}
