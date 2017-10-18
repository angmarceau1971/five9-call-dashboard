////////////////////////////////////////////////////////////////
// Functions to retrieve and extract useful data from Five9.
// These functions interact with our server, which then passes
// requests on to Five9's server.
////////////////////////////////////////////////////////////////

// Get CSV string of report results from Five9
async function getReportResults(params) {
    var reportResults;
    const runReport = await request(params, 'configuration');
    const id = jsonToReturnValue(await runReport.json(), 'runReport');

    // Wait til the report is finished running
    let stillRunning = 'true';
    while (stillRunning == 'true') {
        let runResponse = await request(getParameters('isReportRunning', id),
                                        'configuration');
        stillRunning = jsonToReturnValue(await runResponse.json(), 'isReportRunning');
    }

    // Then retrieve the results
    let resultParams = getParameters('getReportResultCsv', id);
    let reportResult = await request(resultParams, 'configuration');
    let res = await reportResult.json();

    // Return CSV string
    let reportCsv = jsonToReturnValue(res, 'getReportResultCsv');
    return reportCsv;
}


// Let's get started!
// Authorize user to start pulling data in a Statistics session.
// Returns true if successful, and false otherwise.
async function beginSession() {
    // Initiate session with Five9 statistics API
    let params = getParameters('setSessionParameters');
    let response = await request(params);

    if (response.status == 200) {
        console.log('Session has begun!');
        let data = await response.json();
        let fault = getFaultStringFromData(data);
        if (fault != '') throw new Error('Set Session Parameters issue: ' + fault);
    } else {
        console.log(response);
        throw new Error('Set sessions parameters HTTP status code: ' + response.statusCode);
    }
}


// Make a request to server with given parameters (from getParameters)
async function request(parameters, url='statistics') {
    const apiURL = API_URL + url; // defined in api_url.js

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    }

    return fetch(apiURL, requestOptions)
        .then((response) => {
            if (!response.ok) error(response.status);
            return response;
        }).then((response) => {
            return response;
        }).catch((err) => {
            error(err);
        });
}


// Gets the actual returned value/data out of JSON from the server.
function jsonToReturnValue(json, type) {
    return json['env:Envelope']['env:Body'][0]['ns2:'+type+'Response'][0]['return'][0];
}

// takes JSON from server and returns text within 'faultstring' tag (if existant)
function getFaultStringFromData(data) {
    try {
        return data['env:Envelope']['env:Body'][0]['env:Fault'][0]['faultstring'];
    } catch (err) {
        return '';
    }
}

// Given a requestType, returns JSON to submit to server in POST request.
// requestType should match Five9 API command.
// Optional parameters used for some reporting commands.
function getParameters(requestType, reportId=null, criteriaTimeStart=null,
                       criteriaTimeEnd=null) {
    let params = {};

    // Initiate session
    if (requestType == 'setSessionParameters') {
        params = {
            'service': 'setSessionParameters',
            'settings': [ {
                'viewSettings': [
                    { 'idleTimeOut': 1800 },
                    { 'statisticsRange': 'CurrentDay' },
                    { 'rollingPeriod': 'Minutes10' }
                ] }
            ]
        }
    }
    // Get real-time call stats
    if (requestType == 'ACDStatus') {
        params = {
            'service': 'getStatistics',
            'settings': [ {
                'statisticType': 'ACDStatus'
            } ]
        }
    }

    // Report running params
    if (requestType == 'runReport') {
        params = {
            'service': 'runReport',
            'settings': [
                { 'folderName': 'Contact Center Reports' },
                { 'reportName': 'Calls by Zip' },
                { 'criteria': [ {
                    'time': [
                        { 'end': criteriaTimeEnd },
                        { 'start': criteriaTimeStart }
                    ]
                } ] }
            ]
        }
    }
    if (requestType == 'isReportRunning') {
        params = {
            'service': 'isReportRunning',
            'settings': [
                { 'identifier': reportId },
                { 'timeout': '5' }
            ]
        }
    }
    if (requestType == 'getReportResultCsv') {
        params = {
            'service': 'getReportResultCsv',
            'settings': [
                { 'identifier': reportId }
            ]
        }
    }

    // Credentials
    let user = $('.credentials.username').val();
    let pass = $('.credentials.password').val();
    let auth = user + ':' + pass;
    params['authorization'] = btoa(auth); // Base 64 encoding. Yum!

    return params;
}