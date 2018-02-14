import * as hub from './hub';

let comparators = {
    '>=': (value, goal) => value >= goal,
    '<=': (value, goal) => value <= goal
};


export function formatValue(value, field) {
    let formattedValue, style;
    if (typeof(field) == 'string') field = hub.store.getters.field(field);

    if (!field) {
        return {
            value: value,
            styleClass: ''
        }
    }

    if (field.hasGoal) {
        style = comparators[field.comparator](
            value, field.goal
        )
        ? 'green'
        : 'red';
    } else {
        style = '';
    }

    if (field.format.type == 'Number' || field.format.type == 'Percentage') {
        formattedValue = d3.format(field.format.string)(value);
    } else if (field.format.type == 'Duration') {
        formattedValue = moment('2018-01-01').startOf('day')
            .seconds(value)
            .format(field.format.string);
    } else if (field.format.type == 'Time') {
        formattedValue = moment(value).format(field.format.string);
    } else {
        formattedValue = value;
    }

    return {
        value: formattedValue,
        styleClass: style
    };
};
