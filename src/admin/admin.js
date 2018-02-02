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
    return new Promise((resolve, reject) => {
        agenda.on('ready', function() { resolve(agenda.start()) });
    });
}
module.exports.start = start;

async function schedule(user, jobName, time, fun) {
    agenda.define(jobName, fun);
    console.log(`scheduling ${jobName}`);

    // Schedule to run at requested times
    agenda.every(time, jobName);
    return new Promise((resolve, reject) => {
        agenda.jobs({ name: jobName }, function(err, jobs) {
            console.log(`has scheduled ${jobName}`);
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
            console.log('cancelling ' + numRemoved);
            resolve();
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
