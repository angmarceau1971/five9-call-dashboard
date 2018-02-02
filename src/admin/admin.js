const Agenda = require('agenda');
const log = require('../helpers/log'); // recording updates
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const settings = require('../secure_settings');
const skill = require('./skill');


const agenda = new Agenda({db: {
    address: settings.MONGODB_URI,
    collection: 'jobs'
}});
async function start() {
    log.message(`About to start Agenda`)
    return new Promise((resolve, reject) => {
        agenda.on('ready', async function() {
            log.message(`Starting Agenda`);
            await agenda.start();
            log.message(`Agenda has started`);
        });
    });
}
module.exports.start = start;



/**
 * [scheduleSkilling description]
 * @param  {[type]} user    [description]
 * @param  {[type]} jobName [description]
 * @param  {[type]} time    [description]
 * @param  {Object} params  with keys addSkills, removeSkills, and userProfile
 * @return {Promise}        resolves to Agenda job object created
 */
async function scheduleSkilling(user, jobName, time, params) {
    const skiller = async function(job, done) {
        try {
            const data = job.attrs.data;
            log.message(`Skilling with ${JSON.stringify(data)}`);
            await skill.modifyUserProfile(data.addSkills,
                                          data.removeSkills,
                                          data.userProfile);
            done();
        } catch (err) {
            log.error(`Admin Skilling Job Error: ${err}.`);
            done();
        }
    }

    return schedule(user, jobName, time, skiller, params);
}
module.exports.scheduleSkilling = scheduleSkilling;

async function updateSkillingJob(user, job, params) {
    await cancelJob(job._id);
    return scheduleSkilling(user, job.name, job.repeatInterval, params);
}
module.exports.updateSkillingJob = updateSkillingJob;




async function schedule(user, jobName, time, fun, data) {
    log.message(`Scheduling job ${jobName} for ${time} with ${JSON.stringify(data)}.`);

    // Schedule to run at requested times
    agenda.define(jobName, fun);
    if (data) {
        agenda.every(time, jobName, data);
    } else {
        agenda.every(time, jobName);
    }


    // Return new job
    return new Promise((resolve, reject) => {
        agenda.jobs({ name: jobName }, function(err, jobs) {
            if (err) reject(err);
            if (jobs.length > 0) resolve(jobs[0]);
            resolve(jobs);
        });
    });
}
module.exports.schedule = schedule;

async function updateJob(user, job, fun) {
    await cancelJob(job._id);
    return schedule(user, job.name, job.repeatInterval, fun);
}
module.exports.updateJob = updateJob;

async function cancelJob(id) {
    const oid = new mongoose.Types.ObjectId(id);
    return new Promise((resolve, reject) => {
        agenda.cancel({ _id: oid }, async function(err, numRemoved) {
            if (err) reject(err);
            log.message(`Deleting ${numRemoved} job(s) with OID ${id}.`)
            resolve(numRemoved);
        });
    });
}
module.exports.cancelJob = cancelJob;

async function getScheduledJobs(filter={}) {
    return new Promise((resolve, reject) => {
        agenda.jobs(filter, function(err, jobs) {
            if (err) reject(err);
            resolve(jobs);
        });
    });
}
module.exports.getScheduledJobs = getScheduledJobs;
