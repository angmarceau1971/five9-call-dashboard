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
    filter.date = dateFn();;

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
    // TODO: capitalize properly
    return option;
}

const dateMatcher = {
    '<today>': function() {
        return {
            $gte: moment().startOf('day').toDate(),
            $lt:  moment().endOf('day').toDate()
        }
    },
    '<yesterday>': function() {
        return {
            $gte: moment().add(-1, 'days').startOf('day').toDate(),
            $lt:  moment().startOf('day').toDate()
        }
    },
    '<month-to-date>': function() {
        return {
            $gte: moment().startOf('month').toDate(),
            $lt:  moment().endOf('month').toDate()
        }
    }
};
