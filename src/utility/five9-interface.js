const clone = require('ramda/src/clone');
const https = require('https');
const log = require('../utility/log');
const parseString = require('xml2js').parseString; // parse XML to JSON
const pt = require('promise-timeout'); // timeout if Five9 doesn't respond
const secure_settings = require('../secure_settings.js');
const xml = require('xml');


// Request - utility function for Five9 requests. Returns JSON object.
async function request(params, requestType, multipleReturns=false) {
    const soap = jsonToSOAP(params, requestType);
    const response = await sendRequest(soap, params.authorization, requestType);
    return responseToJson(response.body, params.service, multipleReturns);
}

// Opens a statistics API session, if not already open
async function openStatisticsSession() {
    // first, use getSessionParameters to see if a session is already open
    let params = getParameters('getSessionParameters');
    let soap = jsonToSOAP(params, 'statistics');
    let response = await sendRequest(soap, params.authorization, 'statistics');
    if (response.statusCode == 200) {
        return response;
    }

    // No session open -- open with setSessionParameters
    params = getParameters('setSessionParameters');
    soap = jsonToSOAP(params, 'statistics');
    response = await sendRequest(soap, params.authorization, 'statistics');
    if (response.statusCode == 200) {
        log.message('Opening new statistics session - 200 response');
        let fault = getFaultStringFromData(response.body);
        if (fault != '') throw new Error('Set Session Parameters issue: ' + fault);
        return response;
    }
    else {
        log.error('setSessionParameters status != 200, response:' + JSON.stringify(response), 'five9 response', response);
        throw new Error('Set sessions parameters HTTP status code: ' + response.statusCode);
    }
}

// Get CSV string of report results from Five9
async function getReportResults(params) {
    const id = await request(params, 'configuration');

    // Wait til the report is finished running
    let stillRunning = 'true';
    while (stillRunning == 'true') {
        stillRunning = await request(getParameters('isReportRunning', id),
                                     'configuration');
    }
    // Then retrieve the results
    let resultParams = getParameters('getReportResultCsv', id);
    let reportResult = await request(resultParams, 'configuration');

    return reportResult;
}


// Access the Five9 `getUsersGeneralInfo` endpoint, returning the return value
// from there as JSON.
async function getUsersGeneralInfo() {
    let params = getParameters('getUsersGeneralInfo');
    let result = await request(params, 'configuration', true);
    return result;
}

// Access the Five9 `getAgentGroups`
async function getAgentGroups() {
    let params = getParameters('getAgentGroups');
    let result = await request(params, 'configuration', true);
    return result;
}


// Takes a JSON object specifying a Five9 API endpoint,
// and returns a SOAP message to send to the Five9 API.
// requestType: statistics or configuration API
function jsonToSOAP(json, requestType) {
    let adminOrSupervisor;
    if (requestType == 'statistics') adminOrSupervisor = 'supervisor';
    else if (requestType == 'configuration') adminOrSupervisor = 'admin';
    else throw new Error(`requestType ${requestType} is not a valid type in jsonToSOAP!`);

    const service = json['service'];
    const settings = json['settings'] ? xml(json['settings']) : '';
    const soapString =
        `<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.${adminOrSupervisor}.ws.five9.com/">
            <x:Header/>
            <x:Body>
                <ser:${service}>
                    ${settings}
                </ser:${service}>
            </x:Body>
        </x:Envelope>`;
    return soapString;
}

/**
 * Gets the actual returned value/data out of SOAP from the server.
 * @param  {String}  soap           SOAP string returned from Five9 API
 * @param  {String}  service        request endpoint
 * @param  {Boolean} returnMultiple include multiple data points from the SOAP `return`
 *                                      value. true for getUsersGeneralInfo.
 * @return {String}                 Value returned by API
 */
async function responseToJson(soap, service, returnMultiple) {
    let response;
    await parseString(soap, (err, result) => {
        if (err) {
            log.error(err);
            throw new Error(`Error parsing Five9 response: ${err}`);
        }

        let fault = getFaultStringFromData(result);
        if (fault != '') {
            throw new Error(`Five9 responded to ${service} with fault: ${fault}`);
        }
        response = result['env:Envelope']['env:Body'][0][`ns2:${service}Response`];
        if (hasReturnValue(service)) {
            response = response[0]['return'];
        }
    });

    if (returnMultiple) {
        return response;
    } else {
        return response[0];
    }
}

function hasReturnValue(service) {
    if (service == 'modifyUserProfileSkills') {
        return false;
    }
    return true;
}

/**
 * takes JSON from server and returns text within 'faultstring' tag
 * @param  {Object} data JSON from Five9 API
 * @return {String}       fault string / description
 */
function getFaultStringFromData(data) {
    try {
        return data['env:Envelope']['env:Body'][0]['env:Fault'][0]['faultstring'];
    } catch (err) {
        if (err instanceof TypeError) return '';
        else throw err;
    }
}


/**
 * Determine if agent user credentials are valid in Five9.
 * @param  {String} username
 * @param  {String} password
 * @return {Promise -> Boolean} true if credentials are good (200 response code);
 *                              false otherwise
 */
async function agentAuthLogin(username, password) {
    let response = await sendAgentRestApiRequest({
        'passwordCredentials': {
            'username': username,
            'password': password
        },
        // If user is currently logged in, attach to existing session instead of
        // forcing them out
        'policy': 'AttachExisting'
    });
    if (response.statusCode == 200) {
        return true;
    }
    else {
        return false;
    }
}



// Create a request to the Five9 Statistics or Configuration APIs.
// Returns promise.
function sendRequest(message, auth, requestType) {
    let path;
    if (requestType == 'statistics') {
        path = '/wssupervisor/v9_5/SupervisorWebService';
    } else if (requestType == 'configuration') {
        path = '/wsadmin/v9_5/AdminWebService';
    } else {
        throw new Error(`requestType ${requestType} is not a valid type in sendRequest!`);
    }
    // Options for HTTP requests
    const options = {
        hostname: 'api.five9.com',
        path: path,
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'text/xml;charset=UTF-8',
            'Content-Length': Buffer.byteLength(message),
            'SOAPAction': ''
        }
    };

    return httpsRequest(options, message);
}

// Create a request to the Five9 Agent Rest API.
// Returns promise.
function sendAgentRestApiRequest(body) {
    let path = '/appsvcs/rs/svc/auth/login';
    let bodyString = JSON.stringify(body);

    // Options for HTTP requests
    const options = {
        hostname: 'app-scl.five9.com',
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyString)
        }
    };

    return httpsRequest(options, bodyString);
}

/**
 * Wrapper for HTTPS request.
 * @param  {Object} options HTTP options
 * @param  {String} body    body to POST
 * @return {Promise -> Response} response with fields body and statusCode
 */
async function httpsRequest(options, body) {
    // Wrap in promise
    return new Promise((resolve, reject) => {
        // Create the HTTP request
        var req = https.request(options, (res) => {
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
        req.write(body);

        // abort on timeout of 50 seconds
        req.on('socket', (socket) => {
            socket.setTimeout(50000);
            socket.on('timeout', () => {
                log.error(`----- Five9 request timed out\n
                            Body sent in request:\n${body}\n`);
                req.abort();
                reject(new pt.TimeoutError('Five9 request timed out.'));
            });
        });

        // Handle errors
        req.on('error', (e) => {
            log.error(e);
            reject(e);
        });
    });
}


// Given a requestType, returns JSON to submit to server in POST request.
// Builds in authorization, so this should only be used after authenticating
//    the client as needed.
// requestType should match Five9 API command.
// Optional parameters used for some reporting commands.
function getParameters(requestType, reportId=null, criteriaTimeStart=null,
                       criteriaTimeEnd=null, reportName=null) {
    let params = {};
    // Initiate session
    if (requestType == 'setSessionParameters') {
        params = {
            'settings': [ {
                'viewSettings': [
                    { 'idleTimeOut': 1800 },
                    { 'statisticsRange': 'CurrentDay' },
                    { 'rollingPeriod': 'Minutes10' }
                ] }
            ]
        }
    }
    // Check if session is open
    else if (requestType == 'getSessionParameters') {
        params = {}
    }
    // Get real-time call stats
    else if (requestType == 'getStatistics') {
        params = {
            'settings': [ {
                'statisticType': 'ACDStatus'
            } ]
        }
    }
    // Report running params
    else if (requestType == 'runReport') {
        params = {
            'settings': [
                { 'folderName': 'Contact Center Reports' },
                { 'reportName': reportName },
                { 'criteria': [ {
                    'time': [
                        { 'end': criteriaTimeEnd },
                        { 'start': criteriaTimeStart }
                    ]
                } ] }
            ]
        }
    }
    else if (requestType == 'isReportRunning') {
        params = {
            'settings': [
                { 'identifier': reportId },
                { 'timeout': '5' }
            ]
        }
    }
    else if (requestType == 'getReportResultCsv') {
        params = {
            'settings': [
                { 'identifier': reportId }
            ]
        }
    }
    else if (requestType == 'modifyUserProfileSkills') {
        params = {
            'settings': []
        }
    }
    // Get user list w/ basic info
    else if (requestType == 'getUsersGeneralInfo') {
        params = { }
    }
    // Get agent groups with each user
    else if (requestType == 'getAgentGroups') {
        params = {
            'settings': [
                { 'groupNamePattern': '.*' } // include all groups
            ]
        }
    }
    else {
        log.error(`Five9 Request type ${requestType} not recognized.`);
        throw new Error(`Five9 Request type ${requestType} not recognized.`);
    }

    params.service = requestType;

    // Credentials
    let user = secure_settings.FIVE9_USERNAME;
    let pass = secure_settings.FIVE9_PASSWORD;
    let auth = user + ':' + pass;
    params['authorization'] = Buffer.from(auth).toString('base64'); // Base 64 encoding. Yum!

    return params;
}

module.exports.jsonToSOAP = jsonToSOAP;
module.exports.request = request;
module.exports.sendRequest = sendRequest;
module.exports.getParameters = getParameters;
module.exports.getReportResults = getReportResults;
module.exports.getUsersGeneralInfo = getUsersGeneralInfo;
module.exports.getAgentGroups = getAgentGroups;
module.exports.openStatisticsSession = openStatisticsSession;
module.exports.responseToJson = responseToJson;
module.exports.agentAuthLogin = agentAuthLogin;
