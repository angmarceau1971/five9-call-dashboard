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
const Agenda = require('agenda');


let db;

function scheduleJob() {
    function hello() {
        console.log(' ------- hello world! ------- ');
        process.exit(0);
    }
    return admin.schedule(
        db,
        'nate',
        'say hello on the regular',
        '* * * * *',
        hello
    );
}


describe('Scheduling a job', function() {
    this.timeout(70000);
    before(function setup(done) {
        mongoose.connect(settings.MONGODB_URI, {
           useMongoClient: true
        });
        db = mongoose.connection;
        db.on('error', function() {
            console.error.bind(console, 'connection error');
            done();
        });
        db.once('open', function() {
            done();
        });
    });

    describe('through admin', async function() {
        it('should start printing like crazy', async function(done) {
            // scheduleJob();
            const agenda = new Agenda({ db: {address: settings.MONGODB_URI, collection: 'jobs'} });
            await new Promise(resolve => agenda.once('ready', resolve));

            agenda.start();
            console.log('agenda has been started');
            agenda.jobs({}, (err, jobs) => console.log(jobs));
            return new Promise(resolve => setTimeout(resolve, 60000));
        });
    });
});
