/**
 * Handle expression parsing for calculated fields.
 */

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
