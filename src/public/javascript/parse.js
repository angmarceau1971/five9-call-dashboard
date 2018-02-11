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

export function processInputData(data, field) {
    return clone(data).map((datum) => {
        if (field == 'Calculated.aht') {
            datum[field] = datum.calls == 0
                        ? 0
                        : datum.handleTime / datum.calls;
            return datum;
        }
    });
}

export function summarize(data, summaryField, displayFields) {
    // Date keys are coerced to strings by d3.nest, so parse them back if needed
    let keyParse = (key) => key;
    if (summaryField == 'dateDay' || summaryField == 'date') {
        keyParse = (key) => new Date(key);
    }
    // Summarize data
    let nested = d3.nest()
        .key((d) => d[summaryField])
        .rollup((values) => {
            return {
                'Calculated.aht': sum(values, 'handleTime') / sum(values, 'calls')
            }
        })
        .entries(data);
    // Flatten data back to original format
    return nested.map((datum) => {
        return Object.assign(
            datum.value,
            { [summaryField]: keyParse(datum.key) });
    });
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
