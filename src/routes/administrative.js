const verify = require('../authentication/verify'); // check user permissions
const fields = require('../admin/fields');
const goals = require('../admin/goals');
const links = require('../admin/links');
const admin = require('../admin/admin');
const customData = require('../datasources/custom-upload');

// To use this module, require it and pass in router to add endpoints to.
module.exports.addTo = function(router) {
    //////////////////////////////////////////
    // Field endpoints
    // Get list of fields
    router.get('/fields', verify.apiMiddleware(), async (req, res) => {
        let fieldList = await fields.getFieldList();
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(fieldList));
    });

    // Modify a field
    router.put('/fields', verify.apiMiddleware('admin'), async (req, res) => {
        let field = req.body.field;
        let response = await fields.update(field);
        res.set('Content-Type', 'application/text');
        res.status(200).send(`Field "${field.name}" has been updated.`);
    });


    //////////////////////////////////////////
    // Goal endpoints
    // Get list of goals
    router.post('/goals', verify.apiMiddleware(), async (req, res) => {
        let goalList;
        if (req.body.agentGroups) {
            goalList = await goals.getGoalsForAgentGroups(req.body.agentGroups);
        }
        else {
            goalList = await goals.getAll();
        }
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(goalList));
    });

    // Modify a goal
    router.put('/goals', verify.apiMiddleware('admin'), async (req, res) => {
        res.set('Content-Type', 'application/text');
        let goal = req.body.goal;
        try {
            let response = await goals.update(goal);
            res.status(200).send(`Goal "${goal.name}" has been updated.`);
        } catch (err) {
            res.status(500).send(`Error while updating ${goal.name}: ${err}.`);
        }
    });

    // Delete a scheduled goalsing job
    router.delete('/goals', verify.apiMiddleware('admin'), async (req, res) => {
        const numRemoved = await goals.remove(req.body.goal);
        const message = `Goal "${req.body.goal.name}" has been deleted.`;
        res.set('Content-Type', 'application/text');
        res.status(200).send(message);
    });


    //////////////////////////////////////////
    // Custom Datasource endpoints
    // Get list of datasources
    router.get('/datasources', verify.apiMiddleware(), async (req, res) => {
        let datasourceList = await customData.getAll();
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(datasourceList));
    });

    // Modify a datasource
    router.put('/datasources', verify.apiMiddleware('admin'), async (req, res) => {
        res.set('Content-Type', 'application/text');
        let datasource = req.body.datasource;
        try {
            let response = await customData.update(datasource);
            res.status(200).send(`Datasource "${datasource.name}" has been saved.`);
        } catch (err) {
            res.status(500).send(`Error while updating ${datasource.name}: ${err}.`);
        }
    });

    // Delete a data source
    router.delete('/datasources', verify.apiMiddleware('admin'), async (req, res) => {
        const numRemoved = await customData.remove(req.body.datasource);
        const message = `Datasource "${req.body.datasource.name}" has been deleted.`;
        res.set('Content-Type', 'application/text');
        res.status(200).send(message);
    });


    //////////////////////////////////////////
    // Skilling job endpoints
    // Get list of scheduled skilling jobs
    router.get('/skill', verify.apiMiddleware('admin'), async (req, res) => {
        let jobs = await admin.getScheduledJobs();
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(jobs));
    });

    // Modify a skilling job
    router.put('/skill', verify.apiMiddleware('admin'), async (req, res) => {
        const newjob = await admin.updateSkillingJob(req.user.username, req.body.job, req.body.data);
        res.set('Content-Type', 'application/text');
        res.status(200).send(`Job "${req.body.job.data.title}" has been saved.`);
    });

    // Delete a scheduled skilling job
    router.delete('/skill', verify.apiMiddleware('admin'), async (req, res) => {
        const numRemoved = await admin.cancelJob(req.body.job._id);
        const message = numRemoved > 0
                        ? `Job "${req.body.job.data.title}" has been deleted.`
                        : `No job found matching "${req.body.job.data.title}".`;
        res.set('Content-Type', 'application/text');
        res.status(200).send(message);
    });


    //////////////////////////////////////////
    // Helpful Links endpoints
    // Get list of links
    router.post('/links', verify.apiMiddleware(), async (req, res) => {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(await links.getAll()));
    });

    // Modify a link
    router.put('/links', verify.apiMiddleware('admin'), async (req, res) => {
        res.set('Content-Type', 'application/text');
        let link = req.body.link;
        try {
            let response = await links.update(link);
            res.status(200).send(`Link "${link.name}" has been updated.`);
        } catch (err) {
            res.status(500).send(`Error while updating ${link.name}: ${err}.`);
        }
    });

    // Delete a scheduled goalsing job
    router.delete('/links', verify.apiMiddleware('admin'), async (req, res) => {
        const numRemoved = await links.remove(req.body.link);
        const message = `Link "${req.body.link.name}" has been deleted.`;
        res.set('Content-Type', 'application/text');
        res.status(200).send(message);
    });
}
