const clone = require('ramda/src/clone');

export function clean(original, currentUser) {
    let filter = clone(original);

    // Clean up dates
    let dateFn = dateMatcher[filter.date];
    filter.dateDay = dateFn();
    // @todo - may want datetimes
    delete filter.date;

    // Insert actual username
    if (filter.agentUsername.$in.includes('<current user>')) {
        filter.agentUsername.$in[
            filter.agentUsername.$in.indexOf('<current user>')
        ] = currentUser;
    }

    return filter;
}

export function dateOptions() {
    return Object.keys(dateMatcher);
}

const dateMatcher = {
    '<today>': function() {
        let today = moment().startOf('day');
        return {
            $gte: today.toDate(),
            $lt:  today.add(1, 'days').toDate()
        }
    },
    '<yesterday>': function() {
        let today = moment().$gteOf('day');
        return {
            $gte: today.add(-1, 'days').toDate(),
            $lt:  today.toDate()
        }
    },
    '<month-to-date>': function() {
        return {
            $gte: moment().startOf('month').toDate(),
            $lt:  moment().endOf('month').toDate()
        }
    }
};
