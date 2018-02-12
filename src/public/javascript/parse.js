/**
 * Handle expression parsing for calculated fields.
 */

import * as hub from './hub';
const clone = require('ramda/src/clone');

export function getValueForField(data, field) {
    // TODO: calculate based on expressions
    if (field == 'Calculated.aht') {
        return sum(data, 'handleTime') / sum(data, 'calls');
    }
    else if (field == 'Calculated.acw') {
        return sum(data, 'acwTime') / sum(data, 'calls');
    }
    const [source, fieldName] = field.split('.');
    if (source == 'AcdFeed') {
        console.log([source, fieldName]);
        return sum(data, fieldName);
    }
    else {
        throw new Error(`Parser isn't expecting the field name "${field}".`);
    }
}

/**
 * Group and summarize data by a given field.
 * @param  {Object} data         original data from server
 * @param  {String} summaryField field to summarize/group by
 * @param  {Array} valueFields string field names to sum up
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
}

/**
 * Extract overall value from a given set of data.
 * @param  {Object} data
 * @param  {String} field full field name ("source.field" format)
 * @return {Number} value
 */
function process(data, field) {
    if (field == 'Calculated.aht') {
        return sum(data, 'handleTime') / sum(data, 'calls');
    }
    else if (field == 'Calculated.acw') {
        return sum(data, 'acwTime') / sum(data, 'calls');
    }
    const [source, fieldName] = field.split('.');
    if (source == 'AcdFeed') {
        return sum(data, fieldName);
    }
    else {
        throw new Error(`Parser isn't expecting the field name "${field}".`);
    }
}

function sum(obj, key) {
    return obj.reduce((sum, item) => sum + item[key], 0);
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
