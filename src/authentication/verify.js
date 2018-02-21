/*
** Helpers to authenticate users before returning data to them.
**
** Includes login strategy for Passport as well as route middleware.
*/

const five9 = require('../utility/five9-interface');
const log = require('../utility/log');
const users = require('./users');


let basePage = '/';
if (process.env.NODE_ENV == 'production') {
    basePage = '/dashboard';
}

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
