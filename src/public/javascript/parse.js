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
        return sum(data, 'handleTime') / sum(data, 'calls');
    }
    else if (fieldName == 'talk') {
        return sum(data, 'talkTime') / sum(data, 'calls');
    }
    else if (fieldName == 'acw') {
        return sum(data, 'acwTime') / sum(data, 'calls');
    }
    else if (fieldName == 'hold') {
        return sum(data, 'holdTime') / sum(data, 'calls');
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
        return sum(data, 'orders') / sum(data, 'calls');
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
    // Date keys are coerced to strings by d3.nest, so parse them back if needed
    let keyParse = (key) => key;
    if (summaryField == 'dateDay' || summaryField == 'date') {
        keyParse = (key) => new Date(key);
    }
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
    // Flatten the summarized nested data back to original format
    return nested.map((datum) => {
        return Object.assign(
            datum.value,
            { [summaryField]: keyParse(datum.key) });
    });
    // let summaryFields = [summaryField];
    // let nested = d3.nest();
    // for (let f of summaryFields) nested = nested.key((d) => d[f]);
    // let rolledUp =
    //     nested.rollup((values) => {
    //         // Sum up each requested field
    //         return valueFields.reduce((result, field) => {
    //             result[field] = process(values, field);
    //             return result;
    //         }, {});
    //     })
    //     .entries(data);
    // // Flatten the summarized nested data back to original format
    // let flat = rolledUp.map((d) => {
    //     return summaryFields.reduce((result, field) => {
    //         Object.assign(result, {[field]: d.key});
    //         if (result.value.value) {
    //             result.key = result.value.key;
    //             result.value = result.value.value;
    //         }
    //         else {
    //             Object.assign(result, result.value);
    //             delete result.key; delete result.value;
    //         }
    //         return result;
    //     }, d);
    // });
    // return flat;
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
function sum(arr, key) {
    return arr.reduce((total, item) => total + item[key], 0);
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
