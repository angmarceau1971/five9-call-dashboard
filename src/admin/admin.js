const Agenda = require('agenda');
const log = require('../helpers/log'); // recording updates
const skill = require('./skill');

// function scheduleSkillChange(time, userRequesting, skillParameters) {
//
// }


async function schedule(db, user, jobName, time, fun) {
    const agenda = new Agenda().mongo(db, 'jobs');

    agenda.define(jobName, fun);

    // Wait for agenda to connect
    await new Promise(resolve => agenda.once('ready', resolve));

    // Schedule to run at requested times
    agenda.every(time, jobName);
    agenda.start();
}

module.exports.schedule = schedule;
