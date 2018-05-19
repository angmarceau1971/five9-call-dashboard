const email = require('../src/message/email');
const secure = require('../src/secure_settings.js');

process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('Send an email', function() {
    this.timeout(5000);
    it('should send', async function() {
        let options = {
            from: secure.NODEMAILER_USER,
            to: secure.NODEMAILER_USER,
            subject: 'Hello ',
            text: 'hallo world',
            html: '<h1>Hi There!</h1><ul><li>This is an email from your server-self!</li></ul>'
        };
        let res = await email.send(options);
        console.log(res);
        expect(true).to.be.true;
    });
});
