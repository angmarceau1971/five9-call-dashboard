import * as hub from './hub';
const clone = require('ramda/src/clone');

/**
 * Returns a cleaned / formatted copy of widget filter to pass to server or
 * apply to data.
 *
 * @param  {Object} original    filter from widget; can include generic properties
 *                              like `<current user>` and `<month-to-date>`
 * @return {Object}             cleaned up filter for server
 */
export function clean(original) {
    let filter = clone(original);
    const user = hub.store.state.user;

    // Clean up dates
    let dateKey;
    if (filter.date) {
        dateKey = 'date';
    }
    else if (filter.dateDay) {
        dateKey = 'dateDay';
    }
    if (dateKey) {
        let dateFn = dateMatcher[filter[dateKey]];
        filter[dateKey] = dateFn();
    }

    // Insert actual username
    if (filter.agentUsername && filter.agentUsername.$in
        && filter.agentUsername.$in.includes('<current user>')) {
        filter.agentUsername.$in[
            filter.agentUsername.$in.indexOf('<current user>')
        ] = user.username;
    }
    if (filter.agentUsername && filter.agentUsername.$eq == '<current user>') {
        filter.agentUsername.$eq = user.username;
    }
    // Insert actual full name
    if (filter.agentName && filter.agentName.$in
        && filter.agentName.$in.includes("<current user's full name>")) {
        filter.agentName.$in[
            filter.agentName.$in.indexOf("<current user's full name>")
        ] = `${user.lastName}, ${user.firstName}`;
    }


    // Update appropriate skill groups
    if (filter.skillGroup) {
        if (filter.skillGroup.$in[0] == '<current skill group>') {
            filter.skill = { $in: user.skills };
        }
        else {
            throw new Error(`Invalid skill group filter: ${filter.skillGroup}. Must use $in filter.`)
        }
        delete filter.skillGroup;
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
    },
    '<last month>': function() {
        return {
            $gte: moment().subtract(1, 'months').startOf('month').toDate(),
            $lt:  moment().subtract(1, 'months').endOf('month').toDate()
        }
    },
    '<last 3 months>': function() {
        return {
            $gte: moment().subtract(3, 'months').startOf('month').toDate(),
            $lt:  moment().endOf('month').toDate()
        }
    }
};
