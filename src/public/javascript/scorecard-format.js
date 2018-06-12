import * as hub from './hub';

let comparators = {
    '>=': (value, goal) => value >= goal,
    '<=': (value, goal) => value <= goal,
    '<' : (value, goal) => value <  goal,
    '>' : (value, goal) => value >  goal,
    '==': (value, goal) => value == goal,
};


/**
 * Returns a formatted value based on the given value and field.
 * @param  {Any} value usually a numeric value
 * @param  {String or Object} field name of field, or full Field object
 * @param  {String} [skillGroup=null] skill group to apply goal coloring
 * @return {Object}         object with keys 'value' and
 *                          'styleClass' (CSS class name to apply)
 */
export function formatValue(value, field, skillGroup=null) {
    let formattedValue;
    if (typeof(field) == 'string') {
        field = hub.store.getters.field(field);
    }
    if (!field) {
        return {
            value: value,
            styleClass: ''
        }
    }

    let style = getStyleFromGoal(value, field, skillGroup);

    ///////////////////// Number values
    if (isNumberType(field.format.type)) {
        if (isNaN(value) || !isFinite(value)) formattedValue = 'N/A';
        else formattedValue = d3.format(field.format.string)(value);
    ///////////////////// Durations
    } else if (field.format.type == 'Duration') {
        if (isNaN(value) || !isFinite(value)) {
            formattedValue = 'N/A';
        } else {
            let formatString = field.format.string;
            // For times over 1 hour, include hours
            if (value > 3599 && formatString == 'm:ss') {
                formatString = 'H:mm:ss';
            }
            formattedValue = moment('2018-01-01').startOf('day')
                .seconds(value)
                .format(formatString);
        }
    ///////////////////// Time / Date
    } else if (field.format.type == 'Time') {
        formattedValue = moment(value).format(field.format.string);
    ///////////////////// Default to raw value
    } else {
        formattedValue = value;
    }

    return {
        value: formattedValue,
        styleClass: style
    };
};


function getStyleFromGoal(value, field, skillGroup=null) {
    let goal = hub.store.getters.goalForField(field, skillGroup);
    if (isNaN(value) && isNumberType(field.format.type)) {
        return 'font-color-secondary';
    }
    if (!goal) return '';

    let meetsGoal = getGoalComparer(goal.comparator);
    if (meetsGoal === undefined) {
        console.log(`Undefined comparator ${goal.comparator} for ${goal.name}, with field ${field.name}.`);
        return '';
    }

    // 2 goal levels: return green, yellow, or red
    if (goal.thresholds.length == 2) {
        if (meetsGoal(value, goal.thresholds[0])) {
            return 'green';
        } else if (meetsGoal(value, goal.thresholds[1])) {
            return 'yellow';
        } else {
            return 'red';
        }
    }
    // Goal.thresholds.length != 2: return green or ready
    if (meetsGoal(value, goal.thresholds[0])) {
        return 'green';
    } else {
        return 'red';
    }
}

function getGoalComparer(comparator) {
    return comparators[comparator];
}

function isNumberType(fieldType) {
    return (fieldType == 'Number' || fieldType == 'Percentage');
}
