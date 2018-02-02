/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 81);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = error;
/* harmony export (immutable) */ __webpack_exports__["b"] = formatAMPM;
/* harmony export (immutable) */ __webpack_exports__["c"] = getAuthString;
// Send out an error alert in console and on the page.
function error(err, message = '') {
  // timestamp
  let newDate = new Date();
  newDate.setTime(Date.now());
  let dateString = newDate.toTimeString();
  console.log(dateString); // Post to page

  $('#message').text(`Whoops! An error occurred. ${err.message} ${message}`);
  console.log('Error log:');
  console.error(err);
} // Nicely formatted time

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
  return strTime;
} // Combines username and password, then encodes in Base 64. Yum!

function getAuthString(username, password) {
  let auth = username + ':' + password;
  return btoa(auth);
}

/***/ }),

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'http://localhost:3000/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ }),

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["e"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["b"] = getReportResults;
/* harmony export (immutable) */ __webpack_exports__["a"] = getFieldList;
/* harmony export (immutable) */ __webpack_exports__["f"] = updateField;
/* harmony export (immutable) */ __webpack_exports__["c"] = getSkillJobs;
/* harmony export (immutable) */ __webpack_exports__["g"] = updateSkillJob;
/* unused harmony export getParameters */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__local_settings_js__ = __webpack_require__(2);

 ////////////////////////////////////////////////////////////////
// Functions to retrieve and extract data from Five9.
// These functions interact with our server, which houses data
// and formats data originating in Five9 reports.
////////////////////////////////////////////////////////////////
// Get agent/ACD statistics

async function getStatistics(filter) {
  const response = await request(filter, 'statistics');
  return response.json();
} // Get real-time stats

async function queueStats() {
  return getData({}, 'queue-stats');
}
/**
 * Get CSV string of report results from Five9
 * @param  {Object} params
 * @param  {String} type   endpoint: `maps` or `service-level`
 * @return {Object}        JSON data
 */

function getReportResults(params, type) {
  return getData(params, `reports/${type}`);
}
/**
 * List of available fields for widgets.
 * @return {Promise} resolves to array of field objects
 */

async function getFieldList() {
  let response = await request({}, 'fields', 'GET');
  return response.json();
}
/**
 * Updates a field on server.
 * @param  {Object}  field new object
 * @return {Promise} resolves to array of field objects
 */

async function updateField(field) {
  let response = await request({
    field: field
  }, 'fields', 'PUT');
  return response.text();
}
/**
 * List of available scheduled skilling jobs.
 * @return {Promise} resolves to array of field objects
 */

async function getSkillJobs() {
  let response = await request({}, 'skill', 'GET');
  return response.json();
}
/**
 * Updates a scheduled skilling job on server.
 * @param  {Object}  job new object
 * @return {Promise} resolves to server's response
 */

async function updateSkillJob(job) {
  let response = await request({
    job: job
  }, 'skill', 'PUT');
  return response.text();
}
/**
 *  Helper function that pulls credentials from DOM, then makes request to server.
 * @param  {Object} parameters POSTed to server
 * @param  {String} endpoint   at server's API
 * @return {Object}            JSON data
 */

async function getData(parameters, endpoint) {
  const auth = Object(__WEBPACK_IMPORTED_MODULE_0__utility_js__["c" /* getAuthString */])($('.username').val(), $('.password').val());
  parameters['authorization'] = auth;
  const response = await request(parameters, endpoint);
  return await response.json();
} // Make a request to server with given parameters (from getParameters)


async function request(parameters, url = 'statistics', method = 'POST') {
  const apiURL = __WEBPACK_IMPORTED_MODULE_1__local_settings_js__["a" /* API_URL */] + url; // defined in api_url.js

  const requestOptions = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  if (method != 'GET') {
    requestOptions.body = JSON.stringify(parameters);
  }

  return fetch(apiURL, requestOptions).then(async response => {
    if (response.status == 504) notifyServer504(parameters, url); // debugging

    if (!response.ok) {
      let bodyText = await response.text();
      throw new Error(`Server responded with ${response.status} ${response.statusText}: ${bodyText}`);
    }

    return response;
  }).then(response => {
    return response;
  });
}

async function notifyServer504() {
  return fetch(__WEBPACK_IMPORTED_MODULE_1__local_settings_js__["a" /* API_URL */] + 'notify-504');
} // Gets the actual returned value/data out of JSON from the server.


function jsonToReturnValue(json, type) {
  return json['env:Envelope']['env:Body'][0]['ns2:' + type + 'Response'][0]['return'][0];
} // takes JSON from server and returns text within 'faultstring' tag (if existant)


function getFaultStringFromData(data) {
  try {
    return data['env:Envelope']['env:Body'][0]['env:Fault'][0]['faultstring'];
  } catch (err) {
    return '';
  }
} // Given a requestType, returns JSON to submit to server in POST request.
// requestType should match Five9 API command.


function getParameters(requestType) {
  let params = {}; // Initiate session

  if (requestType == 'setSessionParameters') {
    params = {
      'service': 'setSessionParameters',
      'settings': [{
        'viewSettings': [{
          'idleTimeOut': 1800
        }, {
          'statisticsRange': 'CurrentDay'
        }, {
          'rollingPeriod': 'Minutes10'
        }]
      }]
    };
  } // Get real-time call stats


  if (requestType == 'getStatistics') {
    params = {
      'service': 'getStatistics',
      'settings': [{
        'statisticType': 'ACDStatus'
      }]
    };
  } // Credentials


  let user = $('.username').val();
  let pass = $('.password').val();
  params['authorization'] = Object(__WEBPACK_IMPORTED_MODULE_0__utility_js__["c" /* getAuthString */])(user, pass);
  return params;
}

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

// Handles UI interaction for login form
$(document).ready(() => {
  // show Login form
  $('.credentials-cover-toggle').click(() => {
    $('.credentials-form').removeClass('out-of-the-way');
    $('.credentials-cover').addClass('out-of-the-way');
  }); // listen for sign-in button press

  $('.begin-session').click(async event => {
    // prevent redirection
    event.preventDefault(); // clear Five9 credentials box and update Login button text

    $('.credentials-form').addClass('out-of-the-way');
    $('.credentials-cover').removeClass('out-of-the-way');
    $('.credentials-cover-toggle').text('Logged In');
  });
});

/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(82);


/***/ }),

/***/ 82:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__interactions__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__interactions___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__interactions__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__gizmo__ = __webpack_require__(83);



 // timeout to pause event loop when needed

let timeout = null; // Object to manage the gizmos (queue widgets)

let gizmo = null;
$(document).ready(() => {
  gizmo = new __WEBPACK_IMPORTED_MODULE_3__gizmo__["a" /* default */](); // listen for sign-in button press

  $('.begin-session').click(async event => {
    // prevent redirection
    event.preventDefault(); // stop any current event loops running

    if (timeout != null) {
      clearTimeout(timeout);
    } // begin updating data & page every few seconds


    try {
      runQueueDashboard();
    } catch (err) {
      Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* error */])(err, 'Error occurred while queue dashboard was running.');
    }
  }); // Update displayed queue list when user clicks button

  $('.show-skills-list').click(function (event) {
    const id = $(this).closest('.gizmo').attr('id');
    const thisgizmo = gizmo.gizmos[id];
    thisgizmo.showQueueList = !thisgizmo.showQueueList;
    const table = $(this).next('table.queue-list');
    createQueueList(thisgizmo, table);
  });
});

async function runQueueDashboard() {
  async function eventLoop(interval) {
    // Get the current queue data
    let data, slData;
    let time = {};

    try {
      // Retrieve current queue stats
      data = await __WEBPACK_IMPORTED_MODULE_1__api__["e" /* queueStats */](); // Get SL stats

      time.start = moment().format('YYYY-MM-DD') + 'T00:00:00';
      time.end = moment().format('YYYY-MM-DD') + 'T23:59:59';

      try {
        slData = await __WEBPACK_IMPORTED_MODULE_1__api__["b" /* getReportResults */](time, 'service-level'); // slData = [];
      } catch (err) {
        Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* error */])(err, `An error occurred when getting service level data: ${err}`);
        slData = [];
      } // Update the view / DOM


      refreshView(data, slData);
    } catch (err) {
      Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* error */])(err);
    } // restart loop


    timeout = setTimeout(() => {
      eventLoop(interval);
    }, interval);
  } // Refresh every 20 seconds.


  eventLoop(20000);
} // Takes nicely formatted data. Updates dashboard view.
// ${data} : ACD stats (current queue info)
// ${serviceLevel} : service level report


function refreshView(data, serviceLevelData) {
  // update each gizmo on the screen
  $('.gizmo').each((i, gizmoElement) => {
    const thisGizmo = gizmo.gizmos[gizmoElement.id];
    let name = thisGizmo.name;
    let skills = thisGizmo.skillFilter; // Clear old queue list from gizmo

    thisGizmo.queueList = []; // Determine calls and agent stats for this gizmo's skills

    let callsInQueue = 0,
        maxWait = 0,
        agentsLoggedIn = 0,
        agentsNotReady = 0,
        agentsOnCall = 0,
        agentsReady = 0,
        serviceLevel = 0,
        callsOffered = 0,
        abandons = 0;

    for (let i = 0; i < data.length; i++) {
      let queue = data[i]; // Include skills in gizmo filter, or all skills if none are in filter

      if (skills.includes(queue['SkillName']) || skills.length == 0) {
        // Real-time queue metrics
        callsInQueue += queue['CallsInQueue'];
        maxWait = Math.max(maxWait, queue['CurrentLongestQueueTime']);
        agentsLoggedIn = Math.max(agentsLoggedIn, queue['AgentsLoggedIn'].split(' ')[0] * 1);
        agentsNotReady = Math.max(agentsNotReady, queue['AgentsNotReadyForCalls']);
        agentsOnCall = Math.max(agentsOnCall, queue['AgentsOnCall']);
        agentsReady = Math.max(agentsReady, queue['AgentsReadyForCalls']); // Calculate SL and abandon rate

        let metrics = serviceLevelData.reduce((totals, current) => {
          if (current.skill == queue['SkillName']) {
            totals.serviceLevel += current.serviceLevel;
            totals.calls += current.calls;
            totals.abandons += current.abandons;
          }

          return totals;
        }, {
          serviceLevel: 0,
          calls: 0,
          abandons: 0
        });
        serviceLevel += metrics.serviceLevel;
        callsOffered += metrics.calls;
        abandons += metrics.abandons; // Add to list of skills in queue

        if (queue['CallsInQueue'] > 0) {
          thisGizmo.queueList.push({
            skillName: queue['SkillName'],
            callsInQueue: queue['CallsInQueue'],
            maxWait: formatWaitTime(queue['CurrentLongestQueueTime'])
          });
        }
      }
    } // Format wait time from seconds to MM:SS or HH:MM:SS


    let waitString = formatWaitTime(maxWait); // Update metrics

    let SLpercent = callsOffered == 0 ? 'N/A' : Math.round(100 * serviceLevel / callsOffered) + '%';
    let abandonRate = callsOffered == 0 ? 'N/A' : Math.round(100 * abandons / callsOffered) + '%';
    $(gizmoElement).find('.metric.service-level').text(SLpercent);
    $(gizmoElement).find('.metric.abandon-rate').text(abandonRate);
    $(gizmoElement).find('.calls-in-sl').text(serviceLevel);
    $(gizmoElement).find('.calls-out-of-sl').text(callsOffered - serviceLevel);
    $(gizmoElement).find('.metric.calls-in-queue').text(callsInQueue);
    $(gizmoElement).find('.metric.max-wait').text(waitString);
    $(gizmoElement).find('.agents-logged-in').text(agentsLoggedIn);
    $(gizmoElement).find('.agents-not-ready-for-calls').text(agentsNotReady);
    $(gizmoElement).find('.agents-on-call').text(agentsOnCall);
    $(gizmoElement).find('.agents-ready-for-calls').text(agentsReady); // Update queue list, if showing

    if (thisGizmo.showQueueList) {
      const table = $(gizmoElement).find('.queue-list');
      createQueueList(thisGizmo, table);
    }
  }); // gizmo.forEach
  // Clear old messages

  $('#message').text(' '); // Update clock

  $('.clock').text(Object(__WEBPACK_IMPORTED_MODULE_0__utility__["b" /* formatAMPM */])(new Date()));
} // Update queue list in DOM
// ${gizmo} object to build list on. ${table} element storing list.


function createQueueList(thisGizmo, table) {
  table.empty(); // clear old list
  // anything to list?

  if (thisGizmo.queueList.length == 0) return; // Sort by max wait time

  thisGizmo.queueList.sort((a, b) => a.maxWait > b.maxWait ? -1 : 1); // Add headers

  const thead = document.createElement('thead');
  const th1 = document.createElement('th');
  th1.appendChild(document.createTextNode('Skill Name'));
  th1.className += ' type-text';
  const th2 = document.createElement('th');
  th2.appendChild(document.createTextNode('Calls'));
  th2.className += ' type-number';
  const th3 = document.createElement('th');
  th3.appendChild(document.createTextNode('Max Wait'));
  th3.className += ' type-number';
  thead.appendChild(th1);
  thead.appendChild(th2);
  thead.appendChild(th3);
  table.append(thead); // Update DOM from queueList

  thisGizmo.queueList.forEach(queue => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(queue.skillName));
    td1.className += ' type-text';
    const td2 = document.createElement('td');
    td2.appendChild(document.createTextNode(queue.callsInQueue));
    td2.className += ' type-number';
    const td3 = document.createElement('td');
    td3.appendChild(document.createTextNode(queue.maxWait));
    td3.className += ' type-number';
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.append(tr);
  });
} // Turns seconds into nicely formatted MM:SS or HH:MM:SS


function formatWaitTime(seconds) {
  const wait = new Date(null);
  wait.setSeconds(seconds);

  if (seconds < 3600) {
    // MM:SS
    return wait.toISOString().substr(14, 5);
  }

  return wait.toISOString().substr(11, 8); // HH:MM:SS
} // Return formatted column / key assignments
// Takes JSON generated from original Five9 SOAP API response


function jsonToViewData(json, includeFields = ['Skill Name', 'Calls In Queue', 'Current Longest Queue Time', 'Agents Logged In', 'Agents Not Ready For Calls', 'Agents On Call', 'Agents Ready For Calls']) {
  let columns = json['columns'][0]['values'][0]['data'];
  let rows = json['rows'];
  let data = [];

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i]['values'][0]['data'];
    let newRow = {};

    for (let j = 0; j < includeFields.length; j++) {
      let field = includeFields[j];
      newRow[field] = row[columns.indexOf(field)]; // trim extra 0's to fix time formatting (to seconds)

      if (field == 'Current Longest Queue Time') newRow[field] = newRow[field].slice(0, -3);
    }

    data.push(newRow);
  }

  return data;
}

/***/ }),

/***/ 83:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = GizmoManager;
// Handling of queue gizmo widgets.
// Manages state and DOM (modals to edit skills & name).
function GizmoManager() {
  // Object storing info on filters & names for each gizmo-widget
  this.gizmos = null; // which gizmo has a menu open?

  this.openGizmoId = null;

  this.build = function (id = null) {
    let template = document.getElementById('gizmo-template');
    let gizmo = template.cloneNode(true); // update classes to those of a live, wild gizmo

    gizmo.classList.remove('template');
    gizmo.classList.add('gizmo'); // Create an ID and append to DOM

    if (id == null) {
      id = this.nextGizmoId();
    }

    gizmo.id = id;
    $('.gizmo-wrapper').append(gizmo); // Add to gizmos object, but don't overwrite existing ones

    if (!this.gizmos[id]) {
      this.gizmos[id] = {
        name: 'New one!',
        skillFilter: []
      };
    } // set name for DOM


    $(gizmo).find('.department-name').html(this.gizmos[id].name);
    this.setupInteractions(id);
    return id;
  };

  this.remove = function (gizmoID) {
    document.getElementById(gizmoID).remove();
    delete this.gizmos[gizmoID];
    this.save();
  }; // Which gizmo is currently edited in the skill menu? This function will
  // update that gizmo's attributes.


  this.updateCurrent = function (name, skills) {
    this.gizmos[this.openGizmoId].name = name;
    this.gizmos[this.openGizmoId].skillFilter = skillStringToArray(skills);
  }; // Set up menu interactions for a gizmo with the given ID


  this.setupInteractions = function (id) {
    let gizmo = $('#' + id); // Skills menu

    gizmo.find('.skills-edit-toggle').click(function (event) {
      // Show the modal...
      $('.modal').css('display', 'block'); // Track currently open menu...

      this.openGizmoId = id; // And set modal values to match this gizmo

      $('.modal').find('.gizmo-name').val(this.gizmos[id].name);
      $('.modal').find('.skills').val(this.gizmos[id].skillFilter);
    }.bind(this)); // Show/hide queue list

    this.gizmos[id].showQueueList = false;
    gizmo.find('.show-skills-list').click(function (event) {
      gizmo.find('.show-skills-list').toggleClass('selected');
      gizmo.find('.queue-list').toggleClass('hidden');
    }.bind(this));
  }; // Get a new ID string in the form 'gizmo-<integer>'


  this.nextGizmoId = function () {
    if (!this.gizmos) return 'gizmo-0';
    let lastId = Math.max(...Object.keys(this.gizmos).map(id => id.split('-')[1]));
    return `gizmo-${lastId + 1}`;
  }; // set up modal window for editing skills.


  $('.modal').find('.close, .cancel, .save').click(function closeModal() {
    $('.modal').css('display', 'none');
  });
  $('.modal').find('.remove').click(function deleteGizmo() {
    $('.modal').css('display', 'none');
    this.remove(this.openGizmoId);
  }.bind(this));
  $(window).click(function closeModal(event) {
    if ($(event.target).is('.modal')) $('.modal').css('display', 'none');
  }.bind(this)); // Listen for skill filter updates

  $('.modal .save').click(function updateSkillFilter() {
    const name = $('.modal .gizmo-name').val();
    const skills = $('.modal .skills').val();
    $('#' + this.openGizmoId).find('.department-name').html(name);
    this.updateCurrent(name, skills);
    this.save();
  }.bind(this)); // Listen for add-gizmo button

  $('.add-gizmo').click(function addGizmo() {
    let newID = this.build(); // save current state to local storage

    this.save();
  }.bind(this)); // Save gizmos to local storage

  this.save = function () {
    const data = JSON.stringify(this.gizmos);
    localStorage.setItem('user_gizmos', data);
  }; // Load gizmos from local storage on startup


  this.load = function () {
    let data = localStorage.getItem('user_gizmos');

    if (!data) {
      this.gizmos = {};
    } else {
      this.gizmos = JSON.parse(data);
      console.log('Loading gizmos:', this.gizmos); // Build view

      for (const id of Object.keys(this.gizmos)) {
        this.build(id);
      }

      ;
    }
  };

  this.load();
} // Breaks down "skill1, skill2 , skill3" string
//          to ['skill1','skill2','skill3'] array

function skillStringToArray(skillString) {
  if (skillString == '') return [];
  return skillString.split(',').map(skill => skill.trim());
}

/***/ })

/******/ });
//# sourceMappingURL=queues.js.map