/**
 * Wrap async route functions in this to catch errors! They're passed on to the
 * catchers.js routes.
 * @param  {Function} fn route handler
 * @return {Function} error-safe route handler
 */
function err(fn) {
    return function(req, res, next) {
        Promise.resolve(fn(req, res)).catch((err) => {
            return next(err);
        });
    }
}

module.exports.err = err;
