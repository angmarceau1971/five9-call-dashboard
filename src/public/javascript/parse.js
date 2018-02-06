/**
 * Handle expression parsing for calculated fields.
 */


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
