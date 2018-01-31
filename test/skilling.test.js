// Test parsing of fault string (error) responses based on the format returned
// by Five9's configuration API.

// NOTE: this does change actual skills in Five! Be sure to set `userProfile`
// and `skills` to values that won't impact production.

process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const assert = chai.assert;
const five9 = require('../src/helpers/five9-interface');
const skill = require('../src/admin/skill.js');

const userProfile = 'WFM';
const skills = ['TEST_DO_NOT_USE', 'OUTBOUND_DEFAULT'];

describe('Multiple skill adjustments', function() {
    this.timeout(5000);
    it('should add several skills', async function() {
        let res = await skill.modifyUserProfile(skills, [], userProfile);
        console.log(res);
    }),
    it('should remove several skills', async function() {
        let res = await skill.modifyUserProfile([], skills, userProfile);
        console.log(res);
    });
});
