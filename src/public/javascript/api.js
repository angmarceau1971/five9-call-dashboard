import { error } from './utility.js';
import { API_URL } from './local_settings.js';

////////////////////////////////////////////////////////////////
// Functions to retrieve and extract data from Five9.
// These functions interact with our server, which houses data
// and formats data originating in Five9 reports.
////////////////////////////////////////////////////////////////


// Get agent/ACD statistics
export async function getStatistics(filter) {
    const response = await request(filter, 'statistics');
    return response.json();
}

// Get real-time stats
export async function queueStats() {
    return getData({}, 'queue-stats');
}

/**
 * Get CSV string of report results from Five9
 * @param  {Object} params
 * @param  {String} type   endpoint: `maps` or `service-level`
 * @return {Promise -> Object}        JSON data
 */
export function getReportResults(params, type) {
    return getData(params, `reports/${type}`);
}

/**
 * Return user information from username.
 * @param  {String} username
 * @return {Promise -> Object} User's object
 */
export async function getUserInformation(username) {
    const response = await request({}, `users/data/${username}`, 'GET');
    return response.json();
}

/**
 * Set a user's theme preferences.
 * @param  {String} username
 * @param  {Object} newTheme with theme fields
 * @return {Promise -> String} response message
 */
export async function updateUserTheme(username, newTheme) {
    const response = await request({ newTheme: newTheme }, `users/theme`, 'PATCH');
    return response.json();
}


/**
 * List of available fields for widgets.
 * @return {Promise} resolves to array of field objects
 */
export async function getFieldList() {
    let response = await request({}, 'fields', 'GET');
    return response.json();
}
/**
 * Updates a field on server.
 * @param  {Object}  field new object
 * @return {Promise} resolves to array of field objects
 */
export async function updateField(field) {
    let response = await request({field: field}, 'fields', 'PUT');
    return response.text();
}


/**
 * List of all goals.
 * @return {Promise} resolves to array of goal objects
 */
export async function getGoalList() {
    let response = await request({}, 'goals', 'POST');
    return response.json();
}
/**
 * List of goals that apply to the given agent group(s).
 * @param  {Array of Strings}   agentGroups
 * @return {Promise} resolves to array of goal objects
 */
export async function getGoalsForAgentGroups(agentGroups) {
    let response = await request({agentGroups: agentGroups}, 'goals', 'POST');
    return response.json();
}
/**
 * Updates a goal on server.
 * @param  {Object}  goal new object
 * @return {Promise} resolves to response message
 */
export async function updateGoal(goal) {
    let response = await request({goal: goal}, 'goals', 'PUT');
    return response.text();
}
/**
 * Delete a goal from server.
 * @param  {Object}  goal object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteGoal(goal) {
    let response = await request({goal: goal}, 'goals', 'DELETE');
    return response.text();
}

/**
 * List of available scheduled skilling jobs.
 * @return {Promise} resolves to array of field objects
 */
export async function getSkillJobs() {
    let response = await request({}, 'skill', 'GET');
    return response.json();
}
/**
 * Updates a scheduled skilling job on server.
 * @param  {Object}  job new object
 * @return {Promise} resolves to server's response
 */
export async function updateSkillJob(job) {
    // format data
    const format = (skillStr) => skillStr.split(',').map((sk) => sk.trim());

    ['addSkills', 'removeSkills'].map((prop) => {
        let skills = job.data[prop];
        if (typeof(skills) == 'string') {
            job.data[prop] = format(skills);
        }
    });

    let response = await request({job: job, data: job.data}, 'skill', 'PUT');
    return response.text();
}
/**
 * Delete the given skilling job object.
 * @param  {Object} job
 * @return {Promise} resolves to response from server
 */
export async function deleteSkillJob(job) {
    let response = await request({job: job}, 'skill', 'DELETE');
    return response.text();
}

export async function getAdminUsers() {
    let response = await request({}, 'users/admin', 'GET');
    let users = await response.json();
    console.log(users)
    return users;
}

export async function updateAdminUser(user) {
    let response = await request({user: user}, 'users/admin', 'PATCH');
    return response.text();
}

export async function rebootServer() {
    const response = await request({}, 'reboot-server', 'POST');
    return response.text();
}
export async function reloadData(params) {
    const response = await request(params, 'reload-data', 'POST');
    return response.text();
}

/**
 * [uploadData description]
 * @param  {Object} params including fields tableName, csv, and
 *                          confirmedChanges (optional)
 * @return {Promise}       resolves to string (server response message)
 */
export async function uploadData(params) {
    try {
        const response = await request(params, 'upload-data', 'POST');
        return await response.text();
    } catch (err) {
        return err.message;
    }
}

/**
 *  Helper function that pulls credentials from DOM, then makes request to server.
 * @param  {Object} parameters POSTed to server
 * @param  {String} endpoint   at server's API
 * @return {Object}            JSON data
 */
async function getData(parameters, endpoint) {
    const response = await request(parameters, endpoint);
    return await response.json();
}




/**
 * Make a request to server with given parameters.
 * @param  {Object} parameters passed as body of request
 * @param  {String} [url='statistics'] endpoint on server
 * @param  {String} [method='POST'] HTTP action
 * @return {Promise} response from server
 */
async function request(parameters, url='statistics', method='POST') {
    const apiURL = API_URL + url; // defined in api_url.js

    const requestOptions = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }
    if (method != 'GET') {
        requestOptions.body = JSON.stringify(parameters);
    }

    return fetch(apiURL, requestOptions)
        .then(async (response) => {
            if (response.status == 504) notifyServer504(parameters, url); // debugging
            if (!response.ok) {
                let bodyText = await response.text();
                throw new Error(`Server responded with ${response.status} ${response.statusText}: ${bodyText}`);
            }
            return response;
        });
}

async function notifyServer504() {
    return fetch(API_URL + 'notify-504');
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
export function getParameters(requestType) {
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
                ]
            } ]
        }
    }
    // Get real-time call stats
    if (requestType == 'getStatistics') {
        params = {
            'service': 'getStatistics',
            'settings': [ {
                'statisticType': 'ACDStatus'
            } ]
        }
    }

    return params;
}
