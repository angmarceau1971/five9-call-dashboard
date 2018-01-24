const clone = require('ramda/src/clone');

/**
 * Returns a cleaned / formatted copy of widget filter to pass to server.
 * @param  {Object} original    filter from widget
 * @param  {String} currentUser current user's username
 * @return {Object}             cleaned up filter for server
 */
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

export function prettifyDateOption(option) {
    // remove brackets
    option.replace(/[<|>]/, '');

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
        let today = moment().startOf('day');
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
