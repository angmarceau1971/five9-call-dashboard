// Initialize fields database.

process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const fields = require('../src/admin/fields.js');
const report = require('../src/models/report');
const mongoose = require('mongoose');
const secure = require('../src/secure_settings.js'); // local/secure settings

mongoose.Promise = global.Promise;

describe('Initialize field list', function() {
    before(async function setup() {
        await mongoose.connect(secure.MONGODB_URI, {
           useMongoClient: true
        });
    });
    this.timeout(5000);
    it('should list fields', async function() {
        let paths = report.acdFeedSchema.paths;
        let res = await fields.initializeList(paths, 'AcdFeed');
        console.log(res);

    });
});
