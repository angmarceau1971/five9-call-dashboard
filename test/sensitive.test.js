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

const database = require('../src/utility/database');
const secure = require('../src/secure_settings');
const verify = require('../src/authentication/verify');

// Data for tests
let myName = secure.FIVE9_FULLNAME;
let myUsername = secure.FIVE9_USERNAME;
let querySensitiveName = {
    filter: { agentName: { $in: [myName, 'Another, Name'] } },
    source: 'QA',
    user: {username:myUsername}
};
let querySensitiveUsername = {
    filter: { agentUsername: { $in: [myUsername, 'abc@def.com'] } },
    source: 'QA',
    user: {username:myUsername}
};
// NOT sensitive queries
let queryInsensitiveName = {
    filter: { agentName: { $in: [myName] } },
    source: 'QA',
    user: {username:myUsername}
};
let queryInsensitiveUsername = {
    filter: { agentUsername: { $in: [myUsername] } },
    source: 'QA',
    user: {username:myUsername}
};

// Test it!
describe('Verify `couldBeSensitive`', function() {
    database.connect();
    this.timeout(5000); // allow 5 seconds to complete test
    it('should return true for sensitive queries', async function() {
        expect(await verify.couldBeSensitive(querySensitiveName, myUsername)).to.be.true;
        expect(await verify.couldBeSensitive(querySensitiveUsername, myUsername)).to.be.true;
    });
    it('should return false for insensitive queries', async function() {
        expect(await verify.couldBeSensitive(queryInsensitiveName, myUsername)).to.be.false;
        expect(await verify.couldBeSensitive(queryInsensitiveUsername, myUsername)).to.be.false;
    });
});
