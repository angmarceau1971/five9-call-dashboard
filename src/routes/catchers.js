////////////////////////////////////////////////////////////////////////////////
// 404 and error handlers.
// Pass in the Express app, and this will plug in the error-catchers.
//
////////////////////////////////////////////////////////////////////////////////

const log = require('../utility/log'); // recording updates

module.exports.addTo = function(app) {
    console.log(`Adding error catching routes to app`);

    // 404 page
    app.use(function(req, res, next) {
        res.status(404).send(`Sorry, the page you went to could not be found!`)
    });

    // Error handler
    app.use(function(err, req, res, next) {
        log.error(`Uncaught error: ${err}.\n\n    Error stack: ${err.stack}`);
        res.status(500).send(`An error occurred on the server: ${err}.`);
    });
}
