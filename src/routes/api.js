///////////////////////////
// API routes to get data
//
// All routes need to include credentials via the auth token received from
// login page. Some routes require administrator privileges.
//
// /statistics returns all real-time stats
//
// /reports routes take the following parameters in the JSON POST body:
//      - start : start time for data range (YYYY-MM-DD[T]HH:mm:ss)
//      - end   : end time for data range (YYYY-MM-DD[T]HH:mm:ss)
//      - skills : in maps/zip code endpoint, which skill names to filter
//                 for, comma-separated. Matches "like" Five9 skill names.
///////////////////////////

const router = require('express').Router();
const moment = require('moment'); // dates/times
const log = require('../utility/log'); // recording updates
const path = require('path');

const datasource = require('../datasources/controller');
const report = require('../datasources/report'); // data feeds for SL & calls
const queue  = require('../datasources/queue-stats'); // real-time queue feeds
const users = require('../authentication/users'); // stores usernames to check auth
const verify = require('../authentication/verify'); // check user permissions
const customers = require('../customers/customers'); // customer database

const uploader = require('../custom-upload/custom-upload');
const skillGroup = require('../datasources/skill-group');


const addAdminRoutes = require('./administrative.js').addTo(router);

router.post('/statistics', verify.apiMiddleware(), async (req, res) => {
    report.onReady(async () => {
        let data;
        try {
            data = await datasource.getScorecardStatistics(req.body);
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        } catch (err) {
            log.error(`Error during scorecard retrieval: ${err}`);
            res.set('Content-Type', 'application/text');
            res.status(500).send(`An error occurred on the server while getting report data: ${err}`);
        }
    })
});

// Five9 current queue statistics (ACDStatus endpoint at Five9)
router.post('/queue-stats', verify.apiMiddleware(), async (req, res) => {
    try {
        // Send data as response when loaded
        async function sendResponse() {
            let data;
            try {
                data = await queue.getData();
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            } catch (err) {
                res.set('Content-Type', 'application/text');
                res.status(500).send(`An error occurred on the server while getting queue stats: ${err}`);
            }
        }
        queue.onReady(sendResponse);
    } catch (err) {
        log.error('Error during api/queue-stats: ' + JSON.stringify(err));
        res.set('Content-Type', 'application/text');
        res.send('An error occurred on the server during POST.');
    }
});

// Request data to update service level metrics
router.post('/reports/service-level', verify.apiMiddleware(), (req, res) => {
    handleReportRequest(req, res, report.getServiceLevelData);
});

// Request calls by zip code for maps page
router.post('/reports/maps', verify.apiMiddleware(), (req, res) => {
    handleReportRequest(req, res, report.getZipCodeData);
});

// Request customer counts by zip code for maps page
router.post('/reports/customers', verify.apiMiddleware(), async (req, res) => {
    try {
        // Send data
        const data = await customers.getData();
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(data));

    } catch (err) {
        log.error(`Error during handleReportRequest(${dataGetter.name}): ` + JSON.stringify(err));
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when retrieving report information: ${err}`);
    }
});


// Return ZIP3 JSON
router.get('/zip3-data', verify.apiMiddleware(), async (req, res) => {
    await sendPublicFile('zip3-albers.json', req, res);
});

// Return U.S. states JSON
router.get('/states', verify.apiMiddleware(), async (req, res) => {
    await sendPublicFile('states-albers.json', req, res);
});



//////////////////////////////////////
// Administrative Functions         //
//////////////////////////////////////
// Get information stored on a user based on username
// If no username is supplied, returns data for currently logged-in user
router.get('/users/data/:username?', verify.apiMiddleware(), async (req, res) => {
    try {
        let username = req.params.username
                       ? req.params.username : req.user.username;
        const user = await users.getUserInformation(username);
        if (user) {
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(user));
        }
        else {
            throw new Error();
        }
    } catch (err) {
        res.set('Content-Type', 'application/text');
        res.status(400).send(`User "${req.params.username}" not found.`);
    }
});


/**
 * Change a user's theme. Admin's can change any user's theme, while non-admin's
 * can only change their own themes.
 * @param {String} username user to update
 * @param {Object} newTheme new theme object to assign
 * @return {String} success or error message
 */
router.patch('/users/theme', verify.apiMiddleware(), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        let userIsAdmin = await users.isAdmin(req.user.username);
        if (req.user.username != req.body.username && !userIsAdmin) {
            let msg = `Current user ${req.user.username} is trying to change theme for other user "${req.body.username}", but is not admin.`;
            log.error(msg);
            throw new Error(msg);
        }
        await users.updateTheme(req.body.username, req.body.newTheme);
        res.send(`Theme updated successfully.`);
    } catch (err) {
        res.status(500).send(`An error occurred while changing themes: ${err}`);
    }
});

// Get list of admin users
router.get('/users/admin', verify.apiMiddleware('admin'), async (req, res) => {
    const admins = await users.getAdminUsers();
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(admins));
});

// Modify an admin users
router.patch('/users/admin', verify.apiMiddleware('admin'), async (req, res) => {
    // User object passed in PATCH body (not necessarily the same as currently logged-in user)
    await users.updateAdminStatus(req.body.user.username, req.body.user.isAdmin);
    res.set('Content-Type', 'application/text');
    res.status(200).send(`User "${req.body.user.username}" has been updated.`);
});



// Notify server that a 502 has occurred
router.get('/notify-504', verify.apiMiddleware(), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        log.error(`--------LOGGER: 504 reported by client`);
        res.status(200).send('Thanks for the message!');
    } catch (err) {
        res.status(500).send('An error occurred on the server while being notified of 504.');
    }
});

// Reboot the server
router.post('/reboot-server', verify.apiMiddleware('admin'), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        log.error(`--------LOGGER: reboot requested by client at ${moment()}.`);
        res.status(200).send('About to reboot! Closing Express server -- should be restarted by PM2 :)');
        pm2.restart('app', (err) => log.error(`pm2 restart error ${err}`));
    } catch (err) {
        res.status(500).send('An error occurred on the server while attempting reboot.');
    }
});

// Update data in a given range
router.post('/reload-data', verify.apiMiddleware('admin'), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        let times = req.body['time'];

        log.message(`---- Reports database reload requested by client for ${JSON.stringify(times)} ----`);

        await reloadReports(times);
        res.status(200).send(`Report data reloaded for ${JSON.stringify(times)}`);

    } catch (err) {
        res.status(500).send(`An error occurred on the server while attempting data reload: ${err}.`);
    }
});


//////////////////////////////////////
// Handle manual data uploads
//////////////////////////////////////
/**
 * Handle upload of data via CSV.
 * @param {String}  req.body.tableName collection to upload data to
 * @param {String}  req.body.csv data in CSV format
 * @param {Boolean} req.body.confirmedChanges has user already confirmed any
 *                      changes needed (such as adding headers)
 */
router.post('/upload-data', verify.apiMiddleware('admin'), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        if (req.body.tableName == 'SkillGroup') {
            const data = await skillGroup.process(req.body.csv);
            await skillGroup.upload(data);
        }
        else {
            const data = await uploader.parseCsv(req.body.csv);
            await uploader.upload(req.body.tableName, data, req.body.confirmedChanges);
        }
        res.status(200).send(`Data uploaded successfully to ${req.body.tableName}.`);
    } catch (err) {
        res.status(500).send(`${err}.\nCheck that column headers and value formats are correct.`);
    }
});




//////////////////////////////////////
// Helper / validation functions
//////////////////////////////////////
async function reloadReports(time) {
    // Verify user input format and basic value-checking
    let bad = '';
    if (!moment(time.end, 'YYYY-MM-DDTHH:mm:ss', true).isValid())
        bad = time.end;
    if (!moment(time.start, 'YYYY-MM-DDTHH:mm:ss', true).isValid())
        bad = time.start;

    if (bad != '') throw new Error(`Time not in the right format, ya dangus: ${bad}`);

    if (moment(time.start, 'YYYY-MM-DDTHH:mm:ss') >=
        moment(time.end, 'YYYY-MM-DDTHH:mm:ss'))
        throw new Error(`Start time's gotta be less than end time! Come on, you turkey.`);

    // It passed the test... Reload the data!
    return await report.loadData(time);
}


/**
 * Handles all reporting data requests.
 * @param  {Express request} req
 * @param  {Express response} res
 * @param  {Function} dataGetter function that retreives actual data from DB
 *                              (either getServiceLevelData or getZipCodeData)
  */
async function handleReportRequest(req, res, dataGetter) {
    try {
        // Send data as response when loaded
        async function sendResponse() {
            let data;
            try {
                data = await dataGetter(req.body);
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            } catch (err) {
                log.error(`Error during handleReportRequest(${dataGetter.name}): ` + JSON.stringify(err));
                res.set('Content-Type', 'application/text');
                res.status(500).send(`An error occurred on the server while getting report data: ${err}`);
            }
        }
        report.onReady(sendResponse);

    } catch (err) {
        log.error(`Error during handleReportRequest(${dataGetter.name}): ${err}`);
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when retrieving report information: ${err}`);
    }
}


/**
 * Send public GeoJSON file in response
 * @param  {String} fileName in src/public/ folder
 * @param  {Object} req      Express request object
 * @param  {Object} res      Express response object
 */
async function sendPublicFile(fileName, req, res) {
    try {
        log.message(`${fileName} file request from ${req.connection.remoteAddress}`);

        // return JSON zip data
        let dir = path.join(__dirname + `/../public/${fileName}`);
        res.sendFile(dir);
    } catch (err) {
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when getting ${fileName} data: ${err}.`);
    }
}

module.exports = router;
