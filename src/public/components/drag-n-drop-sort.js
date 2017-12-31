
/**
 * Compares card or widget positions and determine which one should be placed first.
 * Used when re-ordering cards/widgets after drag-and-drop operations.
 * Objects are ordered based on their DOM elements:
 *      1)  Top: elements higher up on page go first
 *      2)  Left: elements on the left side go first
 * For the object that was dropped, the mouse's Y & X values are used instead
 * of the top & left of the associated element.
 *
 * @param  {Object} a       widget or card object
 * @param  {Object} b       widget or card object
 * @param  {String} dropId  ID of element that was dropped
 * @param  {Function} el    takes a or b object and returns DOM element
 * @return {Integer}        Order for sort function: -1 if a first,
 *                          +1 if b first, 0 if tied.
 */
export function sortOrder(a, b, event, dropId, el) {
    let left = (x) => el(x).offsetLeft;
    let top  = (x) => el(x).offsetTop;
    let bottom = (x) => top(x) + el(x).clientHeight;

    // If neither element is the dropped card, compare positions
    if (a.id != dropId && b.id != dropId) {
        if (top(a) < top(b)) {
            return -1;
        }
        else if (top(b) < top(a)) {
            return +1;
        }
        return left(a) < left(b) ? -1 : +1;
    }
    // If card `a` is selected...
    if (a.id == dropId) {
        // move forward if it's below the bottom of `b`
        if (event.pageY > bottom(b)) {
            return 1;
        }
        // move forward if it's below the top of `b` and to the
        // of `b`
        if (event.pageY > top(b) && event.pageX > left(b)) {
            return 1;
        }
        // otherwise, let card `b` move ahead
        return -1;
    }
    // ...If card `b` was selected, do the same.
    if (b.id == dropId) {
        if (event.pageY > bottom(a)) {
            return -1;
        }
        if (event.pageY > top(a) && event.pageX > left(a)) {
            return -1;
        }
        return 1;
    }
};
