// Test scheduling of jobs with Agenda.
//
// For first run in environment, `scheduleJob()` needs to be called (see
// commented line in describe).
//
// For subsequent runs, scheduleJob should be commented out to ensure Agenda
// still runs the job persistently.

process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const assert = chai.assert;
const five9 = require('../src/helpers/five9-interface');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const settings = require('../src/secure_settings');
const admin = require('../src/admin/admin.js');


function scheduleJob() {
    function hello() {
        console.log(' ------- hello world! ------- ');
    }
    return admin.schedule(
        'nate',
        'say hello on the regular',
        '* * * * *',
        hello
    );
}
function scheduleSkillThing() {
    // return admin.scheduleSkilling
}


describe('Scheduling a job', function() {
    this.timeout(65000);
    function f(goToSleep) {
        console.log('its bedtime');
    }


    describe('through admin', async function() {
        it('should add a job to `jobs` collection', async function(done) {
            await admin.start();
            let job = await scheduleJob();
            console.log(job);

            const oldName = job.attrs.name;
            // const newName = 'a new name';
            //
            // job.attrs.name = newName;
            // job.attrs.repeatInterval = '1 2 3 4 5';
            // let newJob = await admin.updateJob('nate_again', job, ()=>console.log('wassup'));
            //
            // // clear jobs
            admin.cancelJob(job);
            return new Promise(resolve => setTimeout(resolve, 60000));
        });
    });
});
