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
 * Pull Looker data from given Look
 * @param  {String} lookId
 * @return {Object} JSON data
 */
export async function getLookerData(lookId) {
    let response = await request({lookId: lookId}, 'looker');
    return await response.json();
}

export async function getLogs(query) {
    let response = await request({query: query}, 'logs');
    return await response.json();
}

/**
 * Add entry to sales tracker. Entry will be recorded under the logged-in user.
 * @param {Object} entry          object to save to tracker
 * @param {String} [type='sales'] Which tracker to save to?
 * @return {Promise} resolves on completion
 */
export async function addToTracker(entry, type='sales') {
    let response = await request({ entry }, `tracker/${type}`);
    return await response.text();
}

///////////////////////////////////////////////////////////////////////
// Users
/**
 * Return user information from username.
 * @param  {String} username if blank, will return currently logged-in user's
 *                           data
 * @return {Promise -> Object} User's object
 */
export async function getUserInformation(username = '') {
    let path = username ? `users/data/${username}` : `users/data`;
    const response = await request({}, path, 'GET');
    return response.json();
}
/**
 * Set a user's theme preferences.
 * @param  {String} username
 * @param  {Object} newTheme with theme fields
 * @return {Promise -> String} response message
 */
export async function updateUserTheme(username, newTheme) {
    const response = await request(
        { username: username, newTheme: newTheme },
        `users/theme`, 'PATCH'
    );
    return response.text();
}

// Admin users
export async function getAdminUsers() {
    let response = await request({}, 'users/admin', 'GET');
    let users = await response.json();
    return users;
}
export async function updateAdminUser(user) {
    let response = await request({user: user}, 'users/admin', 'PATCH');
    return response.text();
}

// Supervisor users
export async function getSupervisorUsers() {
    let response = await request({}, 'users/supervisor', 'GET');
    let users = await response.json();
    return users;
}
export async function updateSupervisorUser(user) {
    let response = await request({user: user}, 'users/supervisor', 'PATCH');
    return response.text();
}

// Get list of all users, sorted by last name. Includes users active in the same
// month as `selectedDate`, or later.
export async function getUsers(selectedDate='') {
    const params = selectedDate === '' ? {} : { date: selectedDate };
    let response = await request(params, 'users', 'GET');
    let userList = await response.json();
    return userList.sort((a, b) => a.lastName < b.lastName ? -1 : +1);
}

/**
 * Get list of users who have been active within last @param interval seconds
 * @param  {Number} interval in seconds
 * @return {[Object]} promise resolving to array of user objects
 */
export async function getActiveUsers(interval) {
    let response = await request({}, `users/active/${interval}`, 'GET');
    return response.json();
}

///////////////////////////////////////////////////////////////////////
// Messages
/**
 * Send a message
 * @param  {Object} message with fields to, subject, and body
 * @return {String} response from server
 */
export async function sendMessage(message) {
    let response = await request(
        { message: message },
        'message/send', 'POST'
    );
    return response.text();
}
/**
 * Return current user's messages
 * @return {[Object]} array of message objects
 */
export async function getMessages() {
    let response = await request({}, 'message', 'POST');
    return response.json();
}
/**
* Return messages sent by current user
* @return {[Object]} array of message objects
 */
export async function getSentMessages() {
    let response = await request({}, 'message/sent', 'GET');
    return response.json();
}
/**
 * Return current user's unread messages
 * @return {[Object]} array of message objects
 */
export async function getUnreadMessages() {
    let response = await request({hasRead: false}, 'message', 'POST');
    return response.json();
}
/**
 * Flag a message as "read"
 * @return {String} success message
 */
export async function markMessageRead(message, hasRead=true) {
    let response = await request(
        {id: message._id, hasRead: true},
        'message/mark-read', 'PATCH');
    return response.text();
}

///////////////////////////////////////////////////////////////////////
// Game Elements
export async function getFortuneCookies(unreadOnly=false) {
    let response = await request({},
        `fortune-cookie?unreadOnly=${unreadOnly}`,
        'GET');
    return response.json();
}

///////////////////////////////////////////////////////////////////////
// Fields
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
 * Delete a field from server.
 * @param  {Object}  field object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteField(field) {
    let response = await request({field: field}, 'fields', 'DELETE');
    return response.text();
}


///////////////////////////////////////////////////////////////////////
// Goals
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


///////////////////////////////////////////////////////////////////////
// Layouts
/**
 * Get scorecard JSON layout for given agent group(s) and type.
 * @param  {Array of Strings} agentGroups user's agent groups
 * @param  {String} type either team or individual layout
 * @return {Object}
 */
export async function getLayouts(agentGroups, type) {
    let response = await request({agentGroups: agentGroups, type: type}, 'layout');
    return await response.json();
}
/**
 * List of all layouts.
 * @return {Promise} resolves to array of layout objects
 */
export async function getLayoutList() {
    let response = await request({}, 'layouts', 'POST');
    return response.json();
}
/**
 * Updates a layout on server.
 * @param  {Object}  layout new object
 * @return {Promise} resolves to response message
 */
export async function updateLayout(layout) {
    let response = await request({layout: layout}, 'layouts', 'PUT');
    return response.text();
}
/**
 * Delete a layout from server.
 * @param  {Object}  layout object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteLayout(layout) {
    let response = await request({layout: layout}, 'layouts', 'DELETE');
    return response.text();
}



///////////////////////////////////////////////////////////////////////
// Datasources' settings
/**
 * List of all datasources.
 * @return {Promise} resolves to array of datasource objects
 */
export async function getDatasources() {
    let response = await request({}, 'datasources', 'GET');
    return response.json();
}
/**
 * Updates a datasource on server.
 * @param  {Object}  datasource new object
 * @return {Promise} resolves to response message
 */
export async function updateDatasource(datasource) {
    let response = await request({datasource: datasource}, 'datasources', 'PUT');
    return response.text();
}
/**
 * Delete a datasource from server.
 * @param  {Object}  datasource object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteDatasource(datasource) {
    let response = await request({datasource: datasource}, 'datasources', 'DELETE');
    return response.text();
}

/**
 * Get skill groups with associated names, agentGroups and skills
 * @return {Promise -> [Object]} array of objects from SkillGroup table
 */
export async function getSkillGroups() {
    let response = await request({}, 'skill-group', 'GET');
    return response.json();
}

///////////////////////////////////////////////////////////////////////
// 'Helpful Links'
/**
 * List of all links.
 * @return {Promise} resolves to array of link objects
 */
export async function getLinkList() {
    let response = await request({}, 'links', 'POST');
    return response.json();
}
/**
 * Updates a link on server.
 * @param  {Object}  link new object
 * @return {Promise} resolves to response message
 */
export async function updateLink(link) {
    let response = await request({link: link}, 'links', 'PUT');
    return response.text();
}
/**
 * Delete a link from server.
 * @param  {Object}  link object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteLink(link) {
    let response = await request({link: link}, 'links', 'DELETE');
    return response.text();
}

///////////////////////////////////////////////////////////////////////
// 'Made the Sale' Messages
/**
 * List of all sale messages.
 * @return {Promise} resolves to array of SaleMessage objects
 */
export async function getSaleMessageList() {
    let response = await request({}, 'sale-message', 'POST');
    return response.json();
}
/**
 * Updates a saleMessage on server.
 * @param  {Object}  saleMessage new object
 * @return {Promise} resolves to response message
 */
export async function updateSaleMessage(saleMessage) {
    let response = await request({ saleMessage: saleMessage }, 'sale-message', 'PUT');
    return response.text();
}
/**
 * Delete a saleMessage from server.
 * @param  {Object}  saleMessage object to remove
 * @return {Promise} resolves to response message
 */
export async function deleteSaleMessage(saleMessage) {
    let response = await request({ saleMessage: saleMessage }, 'sale-message', 'DELETE');
    return response.text();
}


///////////////////////////////////////////////////////////////////////
// Skilling jobs
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


///////////////////////////////////////////////////////////////////////
// Server utilities
export async function rebootServer() {
    const response = await request({}, 'reboot-server', 'POST');
    return response.text();
}
export async function reloadData(params) {
    const response = await request(params, 'reload-data', 'POST');
    return response.text();
}

/**
 * Upload CSV file to custom data source.
 * @param  {Object} params including fields datasourceName and csv
 * @return {Promise<String>} resolves to server response message
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
 * Download current skill groups
 * @return {Promise<String CSV>}
 */
export async function downloadSkillGroups() {
    const response = await request({}, 'skill-group-csv', 'GET');
    return await response.text();
}


/**
 * Delete custom data over a given date range.
 * @param  {Object} params  with fields datasourceName, clearStartDate, and clearStopDate
 * @return {Promise -> String} server response message
 */
export async function clearCustomData(params) {
    try {
        const response = await request(params, 'custom-data', 'DELETE');
        return await response.text();
    } catch (err) {
        return err.message;
    }
}

///////////////////////////////////////////////////////////////////////
// Request helpers
///////////////////////////////////////////////////////////////////////

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
    const apiURL = constructURL(parameters, url, method);

    const requestOptions = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }
    if (method.toUpperCase() !== 'GET') {
        requestOptions.body = JSON.stringify(parameters);
    }

    return fetch(apiURL, requestOptions)
        .then(async (response) => {
            if (response.status == 504) notifyServer504(parameters, url); // debugging
            if (!response.ok) {
                let bodyText = await response.text();
                let msg = `${bodyText} (status ${response.status}).`;
                console.log(msg);
                throw new Error(msg);
            }
            return response;
        });
}

function constructURL(parameters, relativeURL, method) {
    let url = new URL(relativeURL, API_URL); // `API_URL` defined in api_url.js
    // append parameters to GET URLs
    if (method.toUpperCase() === 'GET') {
        Object.keys(parameters).forEach((key) => {
            url.searchParams.append(key, parameters[key]);
        });
    }
    return url
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
