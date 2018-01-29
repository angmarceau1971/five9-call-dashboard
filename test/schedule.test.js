// Test scheduling of jobs with Agenda.

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
    this.timeout(60000);
    before(function setup(done) {
        mongoose.connect(settings.MONGODB_URI, {
           useMongoClient: true
        });
        const db = mongoose.connection;
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
            const agenda = new Agenda({ db: {address: settings.MONGODB_URI, collection: 'jobs'} });
            await new Promise(resolve => agenda.once('ready', resolve));
            agenda.start();
            setTimeout(done, 60000);
        });
    });
});
