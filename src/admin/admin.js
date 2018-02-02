const Agenda = require('agenda');
const log = require('../helpers/log'); // recording updates
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const settings = require('../secure_settings');
const skill = require('./skill');


const skillLog = `Skill Job Log:`;

const agenda = new Agenda({db: {
    address: settings.MONGODB_URI,
    collection: 'jobs'
}});
/**
 * Run this whenever server restarts to rev up scheduled jobs.
 * @return {Promises} resolves when Agenda is started
 */
async function start() {
    return new Promise((resolve, reject) => {
        agenda.on('ready', async function() {
            await agenda.start();
            log.message(`Agenda has started.`);

            // Define skill change processor
            agenda.define('skill change', async (job, done) => {
                try {
                    const data = job.attrs.data;
                    log.message(`${skillLog} ${data.title} running with ${JSON.stringify(data)}.`);
                    await skill.modifyUserProfile(data.addSkills,
                                                  data.removeSkills,
                                                  data.userProfile);
                    done();
                } catch (err) {
                    log.error(`${skillLog} ${err}.`);
                    done();
                }
            });
            resolve();
        });
    });
}
module.exports.start = start;


/**
 * Schedule skilling to change at a given time.
 * @param  {String} user   username requesting job
 * @param  {String} time   time to run (Cron format)
 * @param  {Object} params containing `addSkills`, `removeSkills`, and `userProfile`
 * @return {Promise}       resolves to new job
 */
async function scheduleSkilling(user, time, params) {
    return schedule('skill change', user, time, params);
}
module.exports.scheduleSkilling = scheduleSkilling;

/**
 * Update an existing job. Will remove jobs matching given job ID, if any,
 * then create the new job.
 * @param  {String} user   username requesting job
 * @param  {Object} job    being updated
 * @param  {Object} params containing `addSkills`, `removeSkills`, and `userProfile`
 * @return {Promise}       resolves to new job
 */
async function updateSkillingJob(user, job, params) {
    await cancelJob(job._id);
    return scheduleSkilling(user, job.repeatInterval, params);
}
module.exports.updateSkillingJob = updateSkillingJob;


/**
 * Schedules new job
 * @param  {String} jobType Agenda process
 * @param  {String} user   username requesting job
 * @param  {String} time   time to run (Cron format)
 * @param  {Object} data   data to pass to scheduled process function
 * @return {Promise}       resolves to new job
 */
async function schedule(jobType, user, time, data) {
    // Return new job
    return new Promise((resolve, reject) => {
        // use `create` to add a new job of the same jobType
        const job = agenda.create(jobType, data).repeatEvery(time).save();
        resolve(job);
    });
}
module.exports.schedule = schedule;


/**
 * Delete a job.
 * @param  {String}  id
 * @return {Promise} resolves
 */
async function cancelJob(id) {
    const oid = new mongoose.Types.ObjectId(id);
    return new Promise((resolve, reject) => {
        agenda.cancel({ _id: oid }, async function(err, numRemoved) {
            if (err) reject(err);
            log.message(`${skillLog} Deleting ${numRemoved} job(s) with OID ${id}.`)
            resolve(numRemoved);
        });
    });
}
module.exports.cancelJob = cancelJob;

/**
 * Get list of scheduled jobs.
 * @param  {Object} [filter={}] MongoDB filter
 * @return {Promise}            resolves to array of jobs
 */
async function getScheduledJobs(filter={}) {
    return new Promise((resolve, reject) => {
        agenda.jobs(filter, function(err, jobs) {
            if (err) reject(err);
            resolve(jobs);
        });
    });
}
module.exports.getScheduledJobs = getScheduledJobs;
