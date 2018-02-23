const verify = require('../authentication/verify'); // check user permissions
const fields = require('../admin/fields');
const goals = require('../admin/goals');
const admin = require('../admin/admin');


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
    // Get list of fields
    router.get('/goals', verify.apiMiddleware(), async (req, res) => {
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
}
