/**
 * Handle expression parsing for calculated fields.
 */
'use strict';
import * as hub from './hub';

/**
 * Extract an overall value from a set of data, based on the provided field.
 * @param  {Array} data   array of data objects
 * @param  {String} field to extract value for
 * @return {Number}       value
 */
export function getValueForField(data, field) {
    return process(data, field);
}

/**
 * Extract overall value from a given set of data.
 *
 * TODO: Clean this shit up!
 *
 * @param  {Array} data
 * @param  {String} field full field name ("source.field" format)
 * @return {Number} value
 */
function process(data, field) {
    let fieldName = fieldNameFromString(field);
    if (fieldName == 'aht') {
        return (sum(data, 'handleTime') + sum(data, 'acwNotReadyTime')) /
            (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'talk') {
        return sum(data, 'talkTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'acw') {
        return (sum(data, 'acwTime') + sum(data, 'acwNotReadyTime')) /
            (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'hold') {
        return sum(data, 'holdTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'serviceLevel') {
        return sum(data, 'serviceLevel') / sum(data, 'calls');
    }
    else if (fieldName == 'inServiceLevel') {
        return sum(data, 'serviceLevel');
    }
    else if (fieldName == 'outOfServiceLevel') {
        return sum(data, 'calls') - sum(data, 'serviceLevel');
    }
    else if (fieldName == 'abandonRate') {
        return sum(data, 'abandons') / sum(data, 'calls');
    }
    else if (fieldName == 'AgentsLoggedIn' || fieldName == 'AgentsOnCall'
            || fieldName == 'AgentsNotReadyForCalls'
            || fieldName == 'AgentsReadyForCalls'
            || fieldName == 'CurrentLongestQueueTime') {
        return max(data, fieldName);
    }
    else if (fieldName == 'score') {
        return average(data, 'score');
    }
    else if (fieldName == 'attendancePoints') {
        return sum(data, 'pointsAdded') - sum(data, 'pointsRolledOff');
    }
    else if (fieldName == 'code') {
        return data[0]['code'];
    }
    else if (fieldName == 'closeRate') {
        return sum(data, 'orders') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'estimatedCloseRate') {
        return sum(data, 'saleMade') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'notReadyPercentage') {
        return sum(data, 'notReadyTime') / sum(data, 'loginTime');
    }
    else if (fieldName == 'callsHandled') {
        return sum(data, 'calls') - sum(data, 'abandons');
    }
    else if (fieldName == 'sameDayAndNextDayOrders') {
        return sum(data, 'sameDayOrders') + sum(data, 'nextDayOrders');
    }
    else if (fieldName == 'connectRate') {
        return sum(data, 'ordersInstalled') / sum(data, 'ordersEntered');
    }
    else if (fieldName == 'ahtChat') {
        return (sum(data, 'handleTime') + sum(data, 'acwTime') + sum(data, 'acwNotReadyTime')) /
            (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'talkChat') {
        return sum(data, 'handleTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    // default to sum
    else return sum(data, fieldName);
}


/**
 * Group and summarize data by a given field.
 * @param  {Array}  data         original data from server
 * @param  {String} summaryField field to summarize/group by
 * @param  {Array}  valueFields  full field names to summarize stats for
 * @return {Object}              summarized data
 */
export function summarize(data, summaryField, valueFields) {
    // Summarize data
    let nested = d3.nest()
        .key((d) => d[summaryField])
        .rollup((values) => {
            // Sum up each requested field
            return valueFields.reduce((result, field) => {
                result[field] = process(values, field);
                return result;
            }, {});
        })
        .entries(data);

    // Date keys are coerced to strings by d3.nest, so parse them back if needed
    let parseKey = (key) => key;
    if (summaryField == 'dateDay' || summaryField == 'date') {
        parseKey = (key) => new Date(key);
    }
    else if (summaryField == 'agentUsername' || summaryField == 'username') {
        parseKey = (key) => hub.store.getters.nameFromUsername(key);
    }

    // Flatten the summarized nested data back to original format
    return nested.map((datum) => {
        return Object.assign(
            datum.value,
            { [summaryField]: parseKey(datum.key) });
    });
}


/**
 * Return field name without source.
 * @param  {String} field in `source.field` or just `field` format
 * @return {String}       field without `source.`
 */
export function fieldNameFromString(field) {
    let [source, fieldName] = field.split('.');
    if (!fieldName) fieldName = field;
    return fieldName;
}

/**
 *
 * @param  {Array} includeFields array of string field names to include
 * @return {Function} accepts a datum and leaves only fields in @param includeFields
 */
export function filterFields(includeFields) {
    return function(d) {
        let res = {};
        for (let field of includeFields) {
            res[field] = d[field] || d[fieldNameFromString(field)];
        }
        return res;
    }
}


/**
 * Given an array of objects, returns the sum of the chosen field / @param key.
 * @param  {[Object]} arr of objects
 * @param  {String} key property to sum
 * @return {Number}
 */
export function sum(arr, key) {
    return arr.reduce((total, item) => total + (item[key] || 0), 0);
}

/**
 * Takes average of array of objects based on the given key.
 * @param  {Array} arr of objects
 * @param  {String} key property to average
 * @return {Number}
 */
function average(arr, key) {
    return sum(arr, key) / arr.length;
}

/**
 * Returns maximum of given field in array of objects.
 * @param  {Array} arr of objects
 * @param  {String} key property to find maximum of
 * @return {Number}
 */
function max(arr, key) {
    return arr.reduce((high, item) => Math.max(high, item[key] || 0), -Infinity);
}

/**
 *
 * @param  {String} exp expression
 * @return {Array of Strings} names of fields needed to calculate `exp`
 */
function requiredFields(exp) {
    return exp.match(/{([^}]*)}/g)
        .map((field) => field.replace(/[{}]/g, ''));
}

function expressionForField(field) {
    return field.calculation;
}
