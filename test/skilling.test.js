// Test parsing of fault string (error) responses based on the format returned
// by Five9's configuration API.

process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const assert = chai.assert;
const five9 = require('../src/helpers/five9-interface');

const skill = require('../src/admin/skill.js');


const skillString =
    '<skill>OUTBOUND_DEFAULT</skill><skill>TEST_DO_NOT_USE</skill>';


describe('Multiple skill adjustments', function() {
    this.timeout(5000);
    it('should add several skills', async function() {
        let res = await skill.modifyUserProfile(skillString, '', 'WFM');
        console.log(res);

    });
});
