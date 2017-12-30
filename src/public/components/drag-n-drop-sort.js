let left = (el) => el.offsetLeft;
let top  = (el) => el.offsetTop;
let bottom = (el) => top(el) + el.clientHeight;

/**
 * Compares element positions and determine which one should be placed first.
 * Used when re-ordering cards or widgets after drag-and-drop operations.
 * Elements are ordered based on:
 *      1)  Top: elements higher up on page go first
 *      2)  Left: elements on the left side go first
 * For the element that was dropped, the mouse's X and Y values are used instead
 * of the top and left.
 *
 * @param  {element} a card DOM element
 * @param  {element} b other card element for comparison
 * @param  {String}  dropId ID of element that was dropped
 * @return {Integer}   Order for sort function: -1 if a first, +1 if b first, 0
 *                      if tied.
 */
export function sortOrder(a, b, event, dropId) {
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
