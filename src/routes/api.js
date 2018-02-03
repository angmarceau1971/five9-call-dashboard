
///////////////////////////
// API routes to get data
// All routes need to include these parameters in the POST body:
//      - auth  : Base64 'username:password' Five9 credentials
//
// /statistics returns all real-time stats
//
// /reports routes take the following parameters in the JSON POST body:
//      - start : start time for data range (YYYY-MM-DD[T]HH:mm:ss)
//      - end   : end time for data range (YYYY-MM-DD[T]HH:mm:ss)
//      - skills : in maps/zip code endpoint, which skill names to filter
//                 for, comma-separated. Matches "like" Five9 skill names.
///////////////////////////


const express = require('express');
const router = express.Router();
const log = require('../helpers/log'); // recording updates

const admin = require('../admin/admin');
const fields = require('../admin/fields');
const report = require('../models/report'); // data feeds for SL & calls
const queue  = require('../models/queue-stats'); // real-time queue feeds
const users = require('../authentication/users'); // stores usernames to check auth
const verify = require('../authentication/verify'); // check user permissions
const customers = require('../customers/customers');


router.post('/statistics', verify.apiMiddleware(), async (req, res) => {
    report.onReady(async () => {
        let data;
        try {
            data = await report.getScorecardStatistics(req.body);
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        } catch (err) {
            log.error(`Error during scorecard retreival: ` + JSON.stringify(err));
            res.set('Content-Type', 'application/text');
            res.status(500).send(`An error occurred on the server while getting report data: ${err}`);
        }
    })
});


// Five9 current queue statistics (ACDStatus endpoint at Five9)
router.post('/queue-stats', async (req, res) => {
    try {
        // Authenticate user
        const hasPermission = await verify.hasPermission(req.body['authorization']);
        if (!hasPermission) {
            res.set('Content-Type', 'application/text');
            res.status(401).send('Could not authenticate your user.');
            return;
        }

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
router.post('/reports/service-level', (req, res) => {
    handleReportRequest(req, res, report.getServiceLevelData);
});

// Request calls by zip code for maps page
router.post('/reports/maps', (req, res) => {
    handleReportRequest(req, res, report.getZipCodeData);
});

// Request customer counts by zip code for maps page
router.post('/reports/customers', async (req, res) => {
    try {
        // Authenticate user
        const hasPermission = await verify.hasPermission(req.body['authorization']);
        if (!hasPermission) {
            res.set('Content-Type', 'application/text');
            res.status(401).send('Could not authenticate your user.');
            return;
        }
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
router.get('/zip3-data', async (req, res) => {
    await sendPublicFile('zip3-albers.json', req, res);
});

// Return U.S. states JSON
router.get('/states', async (req, res) => {
    await sendPublicFile('states-albers.json', req, res);
});


/**
 * Handles all reporting data requests.
 * @param  {Express request} req
 * @param  {Express response} res
 * @param  {function} dataGetter is the function that retreives actual data from DB
 *                              (either getServiceLevelData or getZipCodeData)
  */
async function handleReportRequest(req, res, dataGetter) {
    try {
        // Authenticate user
        const hasPermission = await verify.hasPermission(req.body['authorization']);
        if (!hasPermission) {
            res.set('Content-Type', 'application/text');
            res.status(401).send('Could not authenticate your user.');
            return;
        }

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
        log.error(`Error during handleReportRequest(${dataGetter.name}): ` + JSON.stringify(err));
        res.set('Content-Type', 'application/text');
        res.status(500).send(`An error occurred on the server when retrieving report information: ${err}`);
    }
}


///////////////////////////
// Administrative API routes
///////////////////////////
// Modify available fields list
router.put('/fields', verify.apiMiddleware(), async (req, res) => {
    // TODO: allow admin only
    let field = req.body.field;
    fields.update(field);
    res.set('Content-Type', 'application/text');
    res.status(200).send(`Field "${field.name}" has been updated.`);
});
// Modify available fields list
router.get('/fields', verify.apiMiddleware(), async (req, res) => {
    // TODO: allow admin only
    let fieldList = await fields.getFieldList();
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(fieldList));
});

// Modify a skilling job
router.put('/skill', verify.apiMiddleware(), async (req, res) => {
    // TODO: allow admin only
    const newjob = await admin.updateSkillingJob(req.body.username, req.body.job, req.body.data);
    res.set('Content-Type', 'application/text');
    res.status(200).send(`Job "${req.body.job.data.title}" has been saved.`);
});
// Get list of scheduled skilling jobs
router.get('/skill', verify.apiMiddleware(), async (req, res) => {
    // TODO: allow admin only
    let jobs = await admin.getScheduledJobs();
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(jobs));
});
// Delete a scheduled skilling job
router.delete('/skill', verify.apiMiddleware(), async (req, res) => {
    // TODO: allow admin only
    const numRemoved = await admin.cancelJob(req.body.job._id);
    const message = numRemoved > 0
                    ? `Job "${req.body.job.data.title}" has been deleted.`
                    : `No job found matching "${req.body.job.data.title}".`;
    res.set('Content-Type', 'application/text');
    res.status(200).send(message);
});

// Notify server that a 502 has occurred
router.get('/notify-504', async (req, res) => {
    res.set('Content-Type', 'application/text');
    try {
        log.error(`--------LOGGER: 504 reported by client`);
        res.status(200).send('Thanks for the message!');
    } catch (err) {
        res.status(500).send('An error occurred on the server while being notified of 504.');
    }
});


// Reboot the server
router.post('/reboot-server', async (req, res) => {
    // TODO: allow admin only
    res.set('Content-Type', 'application/text');
    try {
        log.error(`--------LOGGER: reboot requested by client at ${moment()}.`);
        // Authenticate user
        const hasPermission = await verify.hasPermission(req.body['authorization']);
        if (!hasPermission) { // exit if no permission
            res.set('Content-Type', 'application/text');
            res.status(401).send('Could not authenticate your user.');
            return;
        }

        res.status(200).send('About to reboot! Closing Express server -- should be restarted by PM2 :)');
        pm2.restart('app', (err) => log.error(`pm2 restart error ${err}`));

    } catch (err) {
        res.status(500).send('An error occurred on the server while attempting reboot.');
    }
});


// Update data in a given range
router.post('/reload-data', async (req, res) => {
    // TODO: allow admin only
    res.set('Content-Type', 'application/text');
    try {
        let times = req.body['time'];

        log.message(`---- Reports database reload requested by client for ${JSON.stringify(times)} ----`);

        // Authenticate user
        const hasPermission = await verify.hasPermission(req.body['authorization']);
        if (!hasPermission) { // exit if no permission
            res.set('Content-Type', 'application/text');
            res.status(401).send('Could not authenticate your user.');
            return;
        }

        await reloadReports(times);
        res.status(200).send(`Report data reloaded for ${JSON.stringify(times)}`);

    } catch (err) {
        res.status(500).send(`An error occurred on the server while attempting data reload: ${err}.`);
    }
});
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
 * Send public GeoJSON file in response
 * @param  {String} fileName in /public/ folder
 * @param  {Object} req      Express request object
 * @param  {Object} res      Express response object
 */
async function sendPublicFile(fileName, req, res) {
    try {
        log.message(`${fileName} file request from ${req.connection.remoteAddress}`);

        // return JSON zip data
        let dir = path.join(__dirname + `/public/${fileName}`);
        res.sendFile(dir);
    } catch (err) {
        res.set('Content-Type', 'application/text');
        res.status(500).send('An error occurred on the server when getting U.S. states data.');
    }
}

module.exports = router;
