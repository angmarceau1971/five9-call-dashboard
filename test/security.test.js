process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiHttp = require('chai-http');
const moment = require('moment');

// This file must be created with exports goodUsername, goodPassword,
// badUsername, badPassword, and sampleSkills for map checks
const secure = require('./secure_settings.test');

chai.use(chaiHttp);
const app = require('../src/app');

describe('Testing security (credentials authentication).', function() {
    this.timeout(20000); // allow 20 seconds to complete test

    /////////////////////////////////
    // Test page view access
    describe('Test page view access', function() {
        it('good credentials should pass basic authentication', function(done) {
            const agent = chai.request.agent(app);
            agent.post('/login')
                .send({ username: secure.goodUsername, password: secure.goodPassword })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    return agent.get('/queues')
                        .then(function (res) {
                            expect(res).to.have.status(200);
                            done();
                        });
                });
        });
        it('good admin credentials should pass admin authentication', function(done) {
            const agent = chai.request.agent(app);
            agent.post('/login')
                .send({ username: secure.goodUsername, password: secure.goodPassword })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    return agent.get('/admin')
                        .then(function (res) {
                            expect(res).to.have.status(200);
                            done();
                        });
                });
        });
        it('good basic credentials should be redirected from admin page', function(done) {
            const agent = chai.request.agent(app);
            agent.post('/login')
                .send({ username: secure.goodUsername, password: secure.goodPassword })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    return agent.get('/admin')
                        .redirects(0)
                        // Must catch error due to Chai weirdness with redirects
                        .then(undefined, function (err) {
                            let res = err.response;
                            expect(res).to.have.status(302);
                            done();
                        });
                });
        });
        it('bad credentials should be redirected from requested page', function(done) {
            const agent = chai.request.agent(app);
            agent.post('/login')
                .send({ username: secure.badUsername, password: secure.badPassword })
                .then(function (res) {
                    return agent.get('/queues')
                        .redirects(0)
                        .then(undefined, function (err) {
                            let res = err.response;
                            expect(res).to.have.status(302);
                            done();
                        });
                });
        });
        it('bad password with good username should be redirected from requested page', function(done) {
            const agent = chai.request.agent(app);
            agent.post('/login')
                .send({ username: secure.goodUsername, password: secure.badPassword })
                .then(function (res) {
                    return agent.get('/queues')
                        .redirects(0)
                        .then(undefined, function (err) {
                            let res = err.response;
                            expect(res).to.have.status(302);
                            done();
                        });
                });
        });
    });

    /////////////////////////////////
    // Test API route access
    const endpoints = [
        {"route":"/queue-stats", "method":"POST", "level": "basic"},
        {"route":"/reports/service-level", "method":"POST", "level": "basic"},
        {"route":"/reports/maps", "method":"POST", "level": "basic"},
        {"route":"/reports/customers", "method":"POST", "level": "basic"},
        {"route":"/fields", "method":"GET", "level": "basic"},
        {"route":"/skill", "method":"GET", "level": "admin"},
        {"route":"/users/admin", "method":"GET", "level": "admin"}
    ];
    // parameters for data
    const params = {};
       params.start = moment().format('YYYY-MM-DD') + 'T00:00:00';
       params.end   = moment().format('YYYY-MM-DD') + 'T12:00:00';
       params.skills = 'Care,Tech,Sales'; // for maps endpoint

    describe('Test API route access', function() {
        endpoints.forEach(function test(endpoint) {
            const testMsg = `${endpoint.method} to ${endpoint.route} with access level "${endpoint.level}".`;
            describe(testMsg, function() {
                it(`tests basic authentication: should ${endpoint.level=='basic' ? 'succeed' : 'fail'}`,
                  function(done) {
                    const agent = chai.request.agent(app);
                    agent.post('/login')
                        .send({ username: secure.goodUsername, password: secure.goodPassword })
                        .then(function (res) {
                            const method = endpoint.method == 'POST'
                                        ? agent.post(`/api${endpoint.route}`)
                                        : agent.get(`/api${endpoint.route}`);
                            return method.send(params)
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                expect(res).to.be.json;
                                done();
                            });
                        });
                });
            });
        })
    });
});
