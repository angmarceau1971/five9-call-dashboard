///////////////////////////
// - API ROUTES to GET the DATA -
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
const five9Models = require('../datasources/five9-models'); // five9 data feeds
const five9Update = require('../datasources/five9-update'); // five9 update process
const layouts = require('../layouts/layouts'); // dashboard layouts
const m = require('./middleware'); // error catching
const queue  = require('../datasources/queue-stats'); // real-time queue feeds
const customers = require('../datasources/customers'); // customer database
const salesTracker = require('../datasources/sales-tracker'); //
const users = require('../authentication/users'); // stores usernames to check auth
const verify = require('../authentication/verify'); // check user permissions

const fortune = require('../game/fortune-cookie');
const message = require('../message/message');
const uploader = require('../datasources/custom-upload');
const skillGroup = require('../datasources/skill-group');

// Include endpoints defined in other files
const addAdminRoutes = require('./administrative').addTo(router);

/**
 * Main endpoint to retrieve scorecard statistics for metric dashboard.
 */
router.post('/statistics', verify.apiMiddleware(), verify.userAccess(),
    m.err(async (req, res) => {
        let dataPromises = req.body.map(async (ds) => {
            let stats = await datasource.getScorecardStatistics(ds);
            return {
                data: stats.data,
                meta: stats.meta,
                source: ds
            };
        });
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(await Promise.all(dataPromises)));
    })
);

// Five9 current queue statistics (ACDStatus endpoint at Five9)
router.post('/queue-stats', verify.apiMiddleware(), async (req, res) => {
    try {
        // Send data as response when loaded
        let data;
        try {
            data = await queue.getData();
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        } catch (err) {
            res.set('Content-Type', 'application/text');
            res.status(500).send(`An error occurred on the server while getting queue stats: ${err}`);
        }
    } catch (err) {
        log.error('Error during api/queue-stats: ' + JSON.stringify(err));
        res.set('Content-Type', 'application/text');
        res.send('An error occurred on the server during POST.');
    }
});

// Request data to update service level metrics
router.post('/reports/service-level', verify.apiMiddleware(), (req, res) => {
    handleReportRequest(req, res, five9Models.getServiceLevelData);
});

// Request calls by zip code for maps page
router.post('/reports/maps', verify.apiMiddleware(), (req, res) => {
    handleReportRequest(req, res, five9Models.getZipCodeData);
});

// Request customer counts by zip code for maps page
router.post('/reports/customers', verify.apiMiddleware(), m.err(async (req, res) => {
    // Send data
    const data = await customers.getData();
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
}));

// Add an entry to the sales tracker
router.post('/tracker/sales', verify.apiMiddleware(), m.err(async (req, res) => {
    let entry = req.body.entry;
    await salesTracker.add(
        req.user.username,
        entry.accountNumber,
        entry.saleType,
        entry.dtvSaleMade,
        entry.viasatSaleMade,
        entry.voipSaleMade,
    );
    // Get randomized "made the sale" message
    let message = await salesTracker.saleMessage()
    res.status(200).send(`✓ Sale added to tracker. ${message}`);
}));

//////////////////////////////////////
// Messaging
router.post('/message/send', verify.apiMiddleware('supervisor'), m.err(async (req, res) => {
    let msg = req.body.message;
    msg.from = req.user.username;
    await message.send(msg);
    res.status(200).send(`Message sent successfully.`);
}));

// Return messages sent to current user
// Optionally include @param hasRead; if false, will only return messages that
// haven't been read.
router.post('/message', verify.apiMiddleware(), async (req, res) => {
    try {
        let msgs;
        if (req.body.hasRead == false) {
            msgs = await message.getUnread(req.user.username);
        } else {
            msgs = await message.get(req.user.username);
        }
        res.send(JSON.stringify(msgs));
    } catch (err) {
        log.error(`Error during message get: ` + JSON.stringify(err));
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when retrieving messages: ${err}`);
    }
});

// Mark a message as `read`
// Parameters: `id` of message and new `hasRead` value
router.patch('/message/mark-read', verify.apiMiddleware(), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        await message.markRead(req.body.id, req.user.username, req.body.hasRead);
        res.status(200).send(`Message 'hasRead' attribute set to ${req.body.hasRead}`);
    } catch (err) {
        log.error(`Error while marking message as read: ` + JSON.stringify(err));
        res.status(500).send(`An error occurred on the server when retrieving messages: ${err}`);
    }
});

// Returns messages sent by current user
router.get('/message/sent', verify.apiMiddleware(), m.err(async (req, res) => {
    let msgs = await message.getSent(req.user.username);
    res.send(JSON.stringify(msgs));
}));


//////////////////////////////////////
// Return ZIP3 JSON
router.get('/zip3-data', verify.apiMiddleware(), async (req, res) => {
    await sendPublicFile('json/zip3-albers.json', req, res);
});

// Return U.S. states JSON
router.get('/states', verify.apiMiddleware(), async (req, res) => {
    await sendPublicFile('json/states-albers.json', req, res);
});

// Return scorecard layout based on user's department
router.post('/layout', verify.apiMiddleware(), m.err(async (req, res) => {
    let groups = req.body.agentGroups;
    let type = req.body.type;
    let layoutList = await layouts.getLayoutsForAgentGroups(groups, type);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(layoutList || {}));
}));



//////////////////////////////////////
// Administrative Functions         //
//////////////////////////////////////
// Get information stored on a user based on username
// If no username is supplied, returns data for currently logged-in user
router.get('/users/data/:username?', verify.apiMiddleware(), m.err(async (req, res) => {
    let username = req.params.username
                   ? req.params.username : req.user.username;
    const user = await users.getUserInformation(username);
    if (user) {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(user));
    }
    else {
        throw new Error(`User with username ${username} not found.`);
    }
}));


/**
 * Change a user's theme. Admins can change any user's theme, while non-admin's
 * can only change their own themes.
 * @param {String} username user to update
 * @param {Object} newTheme new theme object to assign
 * @return {String} success or error message
 */
router.patch('/users/theme', verify.apiMiddleware(), m.err(async (req, res) => {
    let userIsAdmin = await users.isAdmin(req.user.username);
    if (req.user.username != req.body.username && !userIsAdmin) {
        let msg = `Current user ${req.user.username} is trying to change theme for other user "${req.body.username}", but is not admin.`;
        log.error(msg);
        throw new Error(msg);
    }
    await users.updateTheme(req.body.username, req.body.newTheme);
    res.set('Content-Type', 'application/text');
    res.send(`Theme updated successfully.`);
}));

/**
 * Retrieve array of all users who have been active in the last 32 days. Only
 * includes the basic info fields:
 *      username, lastName, firstName, agentGroups
 */
router.get('/users', verify.apiMiddleware(), m.err(async (req, res) => {
    let dateParam = req.query.date;
    let baseDate = dateParam ? moment(dateParam) : moment();
    let lastActiveDate = baseDate.subtract({ days: 32 }).toDate();
    const userList = await users.getUsersActiveSince(lastActiveDate);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(userList));
}));

// Notify server that a 504 has occurred
router.get('/notify-504', verify.apiMiddleware(), m.err(async (req, res) => {
    log.error(`504 reported by client!`);
    res.set('Content-Type', 'application/text');
    res.status(200).send('Thanks for the message!');
}));

// Reboot the server
router.post('/reboot-server', verify.apiMiddleware('admin'),
            m.err(async (req, res) => {
    log.error(`--------LOGGER: reboot requested by client at ${moment()}.`);
    res.set('Content-Type', 'application/text');
    res.status(200).send('About to reboot! Closing Express server -- should be restarted by PM2 :)');
    pm2.restart('app', (err) => log.error(`pm2 restart error ${err}`));
}));

// Update data in a given range
router.post('/reload-data', verify.apiMiddleware('admin'),
            m.err(async (req, res) => {
    let times = req.body['time'];
    log.message(`---- Reports database reload requested by client for ${JSON.stringify(times)} ----`);

    await reloadReports(times);

    res.set('Content-Type', 'application/text');
    res.status(200).send(`Report data reloaded for ${JSON.stringify(times)}`);
}));


//////////////////////////////////////
// Handle manual data uploads
//////////////////////////////////////
/**
 * Handle upload of data via CSV.
 * @param {String}  req.body.datasourceName collection to upload data to
 * @param {String}  req.body.csv data in CSV format
 */
router.post('/upload-data', verify.apiMiddleware('admin'), async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        if (req.body.datasourceName == 'SkillGroup') {
            const data = await skillGroup.process(req.body.csv);
            await skillGroup.upload(data);
        }
        else {
            await uploader.upload(req.body.datasourceName, req.body.csv,
                req.body.updateType
            );
        }
        res.status(200).send(`Data uploaded successfully to ${req.body.datasourceName}.`);
    } catch (err) {
        res.status(500).send(`${err}\nCheck that column headers and value formats are correct.`);
    }
});


/**
 * Download current skill -> SkillGroup mapping
 */
router.get('/skill-group-csv', verify.apiMiddleware('admin'), async (req, res) => {
    let csv;
    try {
        csv = await skillGroup.getCsvData();
    } catch (err) {
        res.set('Content-Type', 'application/text');
        res.status(500).send(`${err}\nAn error occurred while creating the skill group CSV download.`);
        return
    }

    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
});

/**
 * Delete custom data over a given range.
 * @param {String} req.body.datasourceName collection to upload data to
 * @param {String} req.body.clearStartDate in YYYY-MM-DD format
 * @param {String} req.body.clearStopDate  in YYYY-MM-DD format
 */
router.delete('/custom-data',
              verify.apiMiddleware('admin'),
              m.err(async (req, res) => {
    res.set('Content-Type', 'application/text');
    let ds = req.body.datasourceName.trim();
    let start = req.body.clearStartDate;
    let stop  = req.body.clearStopDate;
    log.info(`Clearing custom data source ${ds} for ${start} through ${stop}.`,
             'custom data', { username: req.user.username }
    );
    let response = await uploader.clear(ds, start, stop);

    res.status(200).send(`Cleared datasource ${req.body.datasourceName}`
                + ` for the date range ${start}`
                + ` through ${stop}.`);
}));

// Get skill group data
router.get('/skill-group', verify.apiMiddleware(), m.err(async (req, res) => {
    let data = await skillGroup.getAll();
    res.set('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(data));
}));



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
    return await five9Update.loadData(time);
}


/**
 * Handles reporting data requests.
 * @param  {Express request} req
 * @param  {Express response} res
 * @param  {Function} dataGetter function that retreives actual data from DB
 *                              (either getServiceLevelData or getZipCodeData)
  */
async function handleReportRequest(req, res, dataGetter) {
    try {
        // Send data as response when loaded
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
        log.message(`${fileName} file request from user ${req.user.username}`);

        // return JSON zip data
        let dir = path.join(__dirname, `/../public/${fileName}`);
        res.sendFile(dir);
    } catch (err) {
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when getting ${fileName} data: ${err}`);
    }
}

module.exports = router;
