const https = require('https');
const secure = require('../secure_settings'); // Looker paths
const log = require('../utility/log'); // recording updates


/**
 * Get JSON from the Look used by application.
 * Look ID is stored in the ../secure_settings.js file.
 * @param  {String} auth Auth token from Looker login
 * @return {object}      JSON object returned by Looker
 */
async function getJsonData(auth, lookId) {
    let endpoint = `looks/${lookId}/run/json`;
    let params = 'limit=100000';
    let data = await request(params, endpoint, auth, 'GET');
    return JSON.parse(data.body);
}
module.exports.getJsonData = getJsonData;

/**
 * Makes a request to the Looker API.
 * @param  {String} message body of request
 * @param  {String} endpoint API URI endpoint (following base /api/ URL)
 * @param  {String} auth authentication token received from Looker
 * @param  {String} [method='POST']
 * @param  {String} [contentType='application/x-www-form-urlencoded']
 * @return {Promise} Resolves to object: {
 *                      body: response body,
 *                      statusCode: response status code
 *                   }
 */
function request(message, endpoint, auth, method='POST',
                       contentType='application/x-www-form-urlencoded') {
    const path = secure.LOOKER_API_PATH + endpoint;

    // Options for HTTP requests
    const opt = {
        hostname: secure.LOOKER_API_HOSTNAME,
        path: path,
        port: 19999,
        method: method,
        headers: {
            'Authorization': 'token ' + auth,
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(message)
        }
    };

    // Wrap in promise
    return new Promise((resolve, reject) => {
        // Create the HTTP request
        var req = https.request(opt, (res) => {
            var data = [];
            res.on('data', (d) => {
                data.push(d);
            });
            res.on('end', () => {
                var dataString = data.join('');
                resolve({ body: dataString, statusCode: res.statusCode });
            });
        });

        // Send the data
        req.write(message);

        // abort on timeout of 120 seconds
        req.on('socket', (socket) => {
            socket.setTimeout(120000);
            socket.on('timeout', () => {
                log.error(`----- Looker request timed out`);
                req.abort();
                reject(new Error('Looker request timed out.'));
            });
        });

        // Handle errors
        req.on('error', (e) => {
            log.error(e);
            reject(e);
        });
    });
}
module.exports.request = request;



/**
 * Gets the authorization token from Looker for further API requests.
 * @param  {String} client_id     API 3 client ID from Looker
 * @param  {String} client_secret API 3 client secret key from Looker
 * @return {String}               Access token for future API requests
 */
async function getAuthToken() {
    let client_id = secure.LOOKER_CLIENT_ID;
    let client_secret = secure.LOOKER_CLIENT_SECRET;
    let res = await request(
        `client_id=${client_id}&client_secret=${client_secret}`, 'login', ''
    );
    return JSON.parse(res.body)['access_token'];
}
module.exports.getAuthToken = getAuthToken;
