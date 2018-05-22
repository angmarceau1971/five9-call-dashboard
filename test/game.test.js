/**
 * Test game elements.
 */

process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const database = require('../src/utility/database');
const fortune = require('../src/game/fortune-cookie');

let cookie = null;

// Test it!
describe('Create FortuneCookie', function() {
    database.connect();
    this.timeout(5000); // allow 5 seconds to complete test
    it('should return document', async function() {
        cookie = await fortune.add('test-user');
        console.log(cookie);
        expect(cookie).to.be.an('object');
        expect(cookie.username).to.equal('test-user');
    });

    // Clean up
    after(async function() {
        await fortune.remove(cookie._id);
    });
});
