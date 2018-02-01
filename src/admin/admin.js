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


async function schedule(db, user, jobName, time, fun) {
    agenda.define(jobName, fun);

    // Wait for agenda to connect
    await new Promise(resolve => agenda.once('ready', resolve));

    // Schedule to run at requested times
    agenda.every(time, jobName);
    agenda.start();
}
module.exports.schedule = schedule;

async function updateJob(newJob) {
    const id = new mongoose.Types.ObjectId(newJob._id);
    console.log(newJob.name);
    return new Promise((resolve, reject) => {
        agenda.jobs({ _id: id }, function(err, jobs) {
            if (err) reject(err);
            const job = jobs[0];
            job.attrs.name = job.name;
            job.attrs.repeatInterval = job.repeatInterval;
            job.save(function(err) {
                if (err) reject(err);
                resolve(job);
            });
        });
    });
}
module.exports.updateJob = updateJob;

async function getScheduledJobs(filter={}) {
    return new Promise((resolve, reject) => {
        agenda.jobs(filter, function(err, jobs) {
            if (err) reject(err);
            resolve(jobs);
        });
    });
}
module.exports.getScheduledJobs = getScheduledJobs;
