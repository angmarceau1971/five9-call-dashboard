/**
 * Handle expression parsing for calculated fields.
 */

import * as hub from './hub';
const clone = require('ramda/src/clone');

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
 * @param  {Array} data
 * @param  {String} field full field name ("source.field" format)
 * @return {Number} value
 */
function process(data, field) {
    let fieldName = fieldNameFromString(field);
    if (fieldName == 'aht') {
        return sum(data, 'handleTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'talk') {
        return sum(data, 'talkTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'acw') {
        return sum(data, 'acwTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'hold') {
        return sum(data, 'holdTime') / (sum(data, 'calls') - sum(data, 'abandons'));
    }
    else if (fieldName == 'serviceLevel') {
        return sum(data, 'serviceLevel') / sum(data, 'calls');
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


// TODO: get this working properly
export function summarizeByMultiple(datas, summaryFields, valueFields) {
    let data = clone(datas);

    // Empty base object with given valueFields
    let baseDatum = valueFields.reduce((r, field) => {
        r[field] = 0;
        return r;
    }, {});

    // Get key string for an object, based on @param summaryFields
    function getKey(datum) {
        return summaryFields.map((field) => datum[field]).join('-')
    }

    let grouped = data.reduce((r, o) => {
        let key = getKey(o);
        let keyedData = r.get(key) || [];
        keyedData.push(o);
        return r.set(key, keyedData);
    }, new Map);

    // TODO: spread back to proper format
    throw new Error(`summarizeByMultiple() called but not implemented`)
    let result = grouped;

    return result;
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
 * Takes sum of array of objects based on the given key.
 * @param  {Array} arr of objects
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

export function fieldsToServer(fields) {
    return fields.reduce((list, field) => {
        let [source, name] = field.fullName.split('.');
        if (source == 'Calculated') {
            const f = requiredFields(expressionForField(field));
            return list.concat(f.map((n) => n.split('.')[1]));
        }
        return list.concat(name);
    }, []);
}
