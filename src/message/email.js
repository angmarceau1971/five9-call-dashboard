const log = require('../utility/log');
const nodemailer = require('nodemailer');
const secure = require('../secure_settings.js');

// Create transporter with the required configuration
let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    secureConnection: false, // Outlook's connection thru TLS requires this
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: secure.NODEMAILER_USER,
        pass: secure.NODEMAILER_PASS
    }
});

async function send(options) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                log.error(`Error during mail send: ${err}`);
                reject(err);
            }
            resolve(info);
        });
    });
}
module.exports.send = send;
