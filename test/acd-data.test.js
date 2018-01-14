process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const moment = require('moment');

// This file must be created with exports   goodUsername & goodPassword
const secure = require('./secure_settings.test');

chai.use(chaiHttp);
const server = require('../src/app');

describe('Test ACD data retrieval.', function() {
    this.timeout(60000); // allow 60 seconds to complete test
    it('Should return 200 status', (done) => {
        chai.request(server)
        .post('/api/statistics')
        .send({ foo: 'bar' })
        .end((err, res) => {
            res.status.should.eql(200);
            done();
        });
    })
});
