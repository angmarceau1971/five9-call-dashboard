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
/******/ 	return __webpack_require__(__webpack_require__.s = 80);
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

/***/ 1:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'http://localhost:3000/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ }),

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["d"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["b"] = getReportResults;
/* unused harmony export getParameters */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__local_settings_js__ = __webpack_require__(1);

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


async function request(parameters, url = 'statistics') {
  const apiURL = __WEBPACK_IMPORTED_MODULE_1__local_settings_js__["a" /* API_URL */] + url; // defined in api_url.js

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(parameters)
  };
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

/***/ 7:
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

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(81);


/***/ }),

/***/ 81:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interactions__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interactions___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__interactions__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__local_settings__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utility__ = __webpack_require__(0);



 // Handles UI interaction for login form

$(document).ready(() => {
  // show Login form
  $('.credentials-cover-toggle').click(() => {
    $('.admin-panel-wrapper').addClass('out-of-the-way');
  }); // listen for sign-in button press

  $('.begin-session').click(async event => {
    $('.admin-panel-wrapper').removeClass('out-of-the-way');
  }); // Listen for server reboot request

  $('.reboot-server').click(async event => {
    const auth = Object(__WEBPACK_IMPORTED_MODULE_3__utility__["c" /* getAuthString */])($('.username').val(), $('.password').val());
    const body = {
      authorization: auth
    };
    const apiURL = __WEBPACK_IMPORTED_MODULE_2__local_settings__["a" /* API_URL */] + 'reboot-server'; // defined in api_url.js

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/text',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    $('.message').text(`Computing....`);
    fetch(apiURL, requestOptions).then(async response => {
      let bodyText = await response.text();
      $('.message').text(`Response: ${response.status} ${bodyText}`);
    }).catch(err => {
      $('.message').text(`Whoops! that got a: ${err}. Server down much?`);
    });
  }); // Listen for data reload requests

  $('.reload-data').click(async event => {
    const auth = Object(__WEBPACK_IMPORTED_MODULE_3__utility__["c" /* getAuthString */])($('.username').val(), $('.password').val());
    const time = {
      start: $('.start-time').val(),
      end: $('.end-time').val()
    };
    const body = {
      authorization: auth,
      time: time
    };
    const apiURL = __WEBPACK_IMPORTED_MODULE_2__local_settings__["a" /* API_URL */] + 'reload-data'; // defined in api_url.js

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/text',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    $('.message').text(`Computing....`);
    fetch(apiURL, requestOptions).then(async response => {
      let bodyText = await response.text();
      $('.message').text(`Response: ${response.status} ${bodyText}`);
    }).catch(err => {
      $('.message').text(`Whoops! ${err}`);
    });
  });
});

/***/ })

/******/ });
//# sourceMappingURL=admin.js.map