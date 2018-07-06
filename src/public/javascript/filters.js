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
    let users = hub.store.getters.currentUsers;

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
        try {
            filter[dateKey] = dateFn();
        } catch (err) {
            console.log(`Invalid date filter ${filter[dateKey]}: ${err}`);
        }
    }

    // Insert actual username
    if (filter.agentUsername && filter.agentUsername.$in
        && filter.agentUsername.$in.includes('<current user>')) {
        filter.agentUsername.$in = props(users, 'username');
    }

    // Insert actual full name
    if (filter.agentName && filter.agentName.$in
        && filter.agentName.$in.includes("<current user's full name>")) {
        filter.agentName.$in = users.map((user) => `${user.lastName}, ${user.firstName}`);
    }

    // Update appropriate skill groups
    if (filter.skillGroup) {
        if (filter.skillGroup.$in &&
            filter.skillGroup.$in[0] == '<current skill group>') {
            filter.skill = { $in: hub.store.getters.currentSkills };
            delete filter.skillGroup;
        }
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

export function getDates(datePattern) {
    return dateMatcher[datePattern]();
}


const dateMatcher = {
    // Days
    '<today>': function() {
        return {
            $gte: today().startOf('day').toDate(),
            $lt:  today().endOf('day').toDate()
        }
    },
    '<yesterday>': function() {
        return {
            $gte: today().add(-1, 'days').startOf('day').toDate(),
            $lt:  today().startOf('day').toDate()
        }
    },
    '<last 2 days>': function() {
        return {
            $gte: today().add(-2, 'days').startOf('day').toDate(),
            $lt:  today().endOf('day').toDate()
        }
    },
    '<last 3 days>': function() {
        return {
            $gte: today().add(-3, 'days').startOf('day').toDate(),
            $lt:  today().endOf('day').toDate()
        }
    },
    '<last 5 days>': function() {
        return {
            $gte: today().add(-5, 'days').startOf('day').toDate(),
            $lt:  today().endOf('day').toDate()
        }
    },
    // Months
    '<month-to-date>': function() {
        return {
            $gte: today().startOf('month').toDate(),
            $lt:  today().startOf('month').add(1, 'months').toDate()
        }
    },
    '<this month>': function() { // alternate name for month-to-date
        return {
            $gte: today().startOf('month').toDate(),
            $lt:  today().startOf('month').add(1, 'months').toDate()
        }
    },
    '<last month>': function() {
        return {
            $gte: today().subtract(1, 'months').startOf('month').toDate(),
            $lt:  today().startOf('month').toDate()
        }
    },
    '<last 2 months>': function() {
        return {
            $gte: today().subtract(2, 'months').startOf('month').toDate(),
            $lt:  today().startOf('month').add(1, 'months').toDate()
        }
    },
    '<last 3 months>': function() {
        return {
            $gte: today().subtract(3, 'months').startOf('month').toDate(),
            $lt:  today().startOf('month').add(1, 'months').toDate()
        }
    },
    // Pay periods
    '<this pay period>': function() {
        let startDate = startOfPayPeriod(today());
        return {
            $gte: startDate.toDate(),
            $lt: startDate.clone().add(2, 'weeks').toDate()
        };
    },
    '<last pay period>': function() {
        let startDate = startOfPayPeriod(today().subtract(2, 'weeks'));
        return {
            $gte: startDate.toDate(),
            $lt: startDate.clone().add(2, 'weeks').toDate()
        };
    }
};

/**
 * Returns current date, or "as of" data if user is looking at a a different month.
 * @return {Moment} date of today or user's selected "as of" date.
 */
function today() {
    return hub.store.getters.getSelectedDate() || moment();
}


/**
 * @param  {Moment object} date to find pay period of
 * @return {Moment object}      start of pay period that contains @param date
 */
function startOfPayPeriod(date) {
    let startDate;
    let sunday = date.clone().startOf('week');
    // round to nearest day (avoids DST issues)
    let msSincePeriod = moment.duration(sunday.diff(payPeriodStart));
    let hours = msSincePeriod / 1000 / 3600;
    let daysSincePeriodStart = Math.round(hours / 24);
    if (daysSincePeriodStart % 14 == 0) {
        return sunday;
    } else {
        return sunday.subtract(1, 'weeks');
    }
}
let payPeriodStart = moment('2018-03-11');

/**
 * Used to get a list of property values from a list of objects. For example,
 * given an array of user objects and the @param property 'username', will
 * return an array of usernames.
 *
 * @param  {Array of Objects} array objects to extract property from
 * @param  {String} property name of property to extract
 * @return {Array of values} array of values from given property
 */
function props(array, property) {
    return array.map((element) => element[property]);
}
