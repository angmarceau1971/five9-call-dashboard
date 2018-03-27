/**
 * Test that a non-sup, non-admin user can't access another user's custom data.
 *
 * MODULES TESTED:
 *  authentication/verify.js
 *  authentication/users.js
 */


process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const verify = require('../src/authentication/verify');

// Data for tests
let myName = 'Smith, Bob';
let myUsername = 'bsmith@bsmith.com';
let querySensitiveName = {
    body: {
        filter: { agentName: { $in: [myName, 'Another, Name'] } },
        source: 'QA'
    },
    user: {username:myUsername}
};
let querySensitiveUsername = {
    body: {
        filter: { agentUsername: { $in: [myUsername, 'abc@def.com'] } },
        source: 'QA'
    },
    user: {username:myUsername}

};
let queryInsensitiveName = {
    body: {
        filter: { agentName: { $in: [myName] } },
        source: 'QA'
    },
    user: {username:myUsername}

};
let queryInsensitiveUsername = {
    body: {
        filter: { agentUsername: { $in: [myUsername] } },
        source: 'QA'
    },
    user: {username:myUsername}

};

// Test it!
describe('Verify `couldBeSensitive`', function() {
    this.timeout(5000); // allow 20 seconds to complete test
    it('should return true for sensitive queries', async function(done) {
        expect(await verify.couldBeSensitive(querySensitiveName)).to.be.true;
        expect(await verify.couldBeSensitive(querySensitiveUsername)).to.be.true;
        done()
    });
    it('should return false for insensitive queries', async function(done) {
        expect(await verify.couldBeSensitive(queryInsensitiveName)).to.be.false;
        expect(await verify.couldBeSensitive(queryInsensitiveUsername)).to.be.false;
        done();
    });
});
