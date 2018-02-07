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
    filter.date = dateFn();

    // Insert actual username
    // if (filter.agentUsername.$in.includes('<current-user>')) {
    //     filter.agentUsername.$in[
    //         filter.agentUsername.$in.indexOf('<current-user>')
    //     ] = currentUser;
    // }
    if (filter.agentUsername.$eq == '<current-user>') {
        filter.agentUsername.$eq = currentUser;
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

const formatString = 'YYYY-MM-DD[T]hh:mm:ss';
const dateMatcher = {
    '<today>': function() {
        return {
            $gte: moment().startOf('day').format(formatString),
            $lt:  moment().endOf('day').format(formatString)
        }
    },
    '<yesterday>': function() {
        return {
            $gte: moment().add(-1, 'days').startOf('day').format(formatString),
            $lt:  moment().startOf('day').format(formatString)
        }
    },
    '<month-to-date>': function() {
        return {
            $gte: moment().startOf('month').format(formatString),
            $lt:  moment().endOf('month').format(formatString)
        }
    }
};
