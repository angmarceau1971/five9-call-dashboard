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
/******/ 	return __webpack_require__(__webpack_require__.s = 74);
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
/* harmony export (immutable) */ __webpack_exports__["b"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["c"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["a"] = getReportResults;
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

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(75);


/***/ }),

/***/ 75:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__interactions__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__interactions___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__interactions__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__maps__ = __webpack_require__(76);



 // General functions to initiate the call map dashboard.
// Uses the CallMap class defined in maps.js to draw the D3 map.
// timeout to pause event loop when needed

let timeout = null;
const mapSettings = {
  display: 'total'
};
$(document).ready(() => {
  let callMap = new __WEBPACK_IMPORTED_MODULE_3__maps__["a" /* default */](); // listen for sign-in and update button presses

  $('.begin-session, .filters-wrapper .update').click(async event => {
    // stop any current event loops running
    if (timeout != null) {
      clearTimeout(timeout);
    } // Update map every 4 minutes


    startUpdatingMap(callMap, 4 * 60);
  }); // Listen for changes to the filter settings

  setupFilterListeners();
});

function setupFilterListeners() {
  // handle toggle for relative / absolute date filters
  $('.date-type-toggle').children().click(event => {
    // Relative button was chosen
    if ($(event.currentTarget).hasClass('relative')) {
      // Update toggle buttons to show current selection
      $('.date-type-toggle .relative').addClass('checked');
      $('.date-type-toggle .absolute').removeClass('checked'); // Display the appropriate date selection

      $('.date-filter-inputs.absolute').addClass('hidden');
      $('.date-filter-inputs.relative').removeClass('hidden'); // Absolute button was clicked
    } else {
      $('.date-type-toggle .absolute').addClass('checked');
      $('.date-type-toggle .relative').removeClass('checked');
      $('.date-filter-inputs.relative').addClass('hidden');
      $('.date-filter-inputs.absolute').removeClass('hidden');
    }
  }); // Handle selection of Today vs Last X Minutes for relative filters

  $('.relative-date-selector').change(() => {
    if ($('.relative-date-selector').val() == 'last-x-minutes') {
      $('.relative-parameters-wrapper').removeClass('hidden');
    } else {
      $('.relative-parameters-wrapper').addClass('hidden');
    }
  }); // Alternate between mapping total calls or calls per customer count

  $('.call-display-toggle').children().click(event => {
    // Was Total button clicked?
    if ($(event.currentTarget).hasClass('total')) {
      mapSettings.display = 'total';
      $('.call-display-toggle .total').addClass('checked');
      $('.call-display-toggle .relative').removeClass('checked'); // show minimum customer filter

      $('.call-display .minimum-customers-wrapper').addClass('hidden'); // Relative display was chosen
    } else {
      mapSettings.display = 'relative';
      $('.call-display-toggle .total').removeClass('checked');
      $('.call-display-toggle .relative').addClass('checked');
      $('.call-display .minimum-customers-wrapper').removeClass('hidden');
    }
  });
} // Begins a loop of updating the map data every ${refreshRate} seconds


async function startUpdatingMap(callMap, refreshRate) {
  try {
    $('.message').text(`Updating...`);
    await updateMap(callMap);
    $('.message').text('Last updated ' + moment().format('h:mm:ss A') + '.');
  } catch (err) {
    Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* error */])(err);
  }

  timeout = setTimeout(() => startUpdatingMap(callMap, refreshRate), refreshRate * 1000);
} // Update callMap (d3 map object) based on parameters in page


async function updateMap(callMap) {
  const params = reportTimeRange();
  params.skills = $('.skills.filter').val(); // get all the datas

  let customerData = await getCustomerData();
  const callData = await __WEBPACK_IMPORTED_MODULE_1__api__["a" /* getReportResults */](params, 'maps'); // build data object off of customerData zip codes

  let data = Object.keys(customerData).map(zip => ({
    zipCode: zip,
    calls: callData.filter(d => d.zipCode == zip).reduce((sum, d) => sum + d.calls, 0),
    customers: customerData[zip]
  })); // if any zips with calls are missing from customerData, add them here

  let missing = getZipsWithoutCustomers(callData, customerData);
  data.concat(missing); // Determine the field being mapped -- total calls or per customer

  let field;

  if (mapSettings.display == 'total') {
    field = 'calls';
    callMap.keyTitle = 'Calls offered';
    callMap.formatLegend = d3.format('d');
  } else if (mapSettings.display == 'relative') {
    field = 'callsPerCustomer';
    callMap.keyTitle = 'Calls offered divided by customer base';
    callMap.formatLegend = d3.format('.1%');
  } // If we're in relative display mode, the user can filter areas meeting a
  // minimum customer count


  let filterFn;

  if (mapSettings.display == 'relative') {
    let minCustomers = $('.minimum-customers').val() * 1;

    filterFn = d => d.value.customers >= minCustomers;
  } else {
    filterFn = d => true;
  } // Key and value extractor functions


  const keyFn = d => d.zipCode.substring(0, 3);

  const rollupFn = d => {
    let calls = d3.sum(d, x => x.calls);
    let customers = d3.sum(d, x => x.customers);
    let callsPerCustomer;
    if (customers == 0) callsPerCustomer = 0;else callsPerCustomer = calls / customers;
    return {
      'calls': calls,
      'customers': customers,
      'callsPerCustomer': callsPerCustomer
    };
  }; // Create the data structure in a D3-friendly way


  let callsByZip = d3.nest().key(keyFn).rollup(rollupFn).entries(data).filter(filterFn).filter(d => d.key != ''); // remove calls with no zipcode assigned

  callMap.update(callsByZip, field, keyFn, rollupFn);
  console.log('Finished updateMap() at ' + moment().format('h:mm:ss A'));
} // Object to store customer zipcode data.


const customerCount = {
  data: [],
  // record time of last update (default to Y2K to force an update)
  lastUpdated: moment('2000-01-01')
};
/**
 * Retrieve customer counts by zip code. Updates from the server every 6 hours.
 * @return {Object} in format { '<zip code here>': '31415' }
 */

async function getCustomerData() {
  // reload data from server if it's been 6+ hours since the last update
  if (customerCount.lastUpdated.isBefore(moment().subtract(6, 'hours'))) {
    let rawData = await __WEBPACK_IMPORTED_MODULE_1__api__["a" /* getReportResults */]({}, 'customers'); // Convert array of objects to a single object, with zipcode as key
    // and customer count as volue

    customerCount.data = rawData.reduce((object, item) => {
      object[item.zipCode] = item.customerCount;
      return object;
    }, {});
    customerCount.lastUpdated = moment();
  }

  return customerCount.data;
}

function getZipsWithoutCustomers(callData, customerData) {
  callData.filter(d => isZipWithoutCustomers(d.zipCode, customerData)).map(d => ({
    zipCode: d.zipCode,
    calls: d.calls,
    customers: 0
  }));
}

function isZipWithoutCustomers(zip, customerData) {
  return zip != '' && !customerData.hasOwnProperty(zip);
} // Determines start/end times chosen by user
// Return {start:'X',end:'Y'}


function reportTimeRange() {
  const time = {}; // Are we using absolute dates?

  if ($('.date-type-toggle .absolute').hasClass('checked')) {
    time.start = moment($('.filter.start-time').val()).tz('America/Los_Angeles').format('YYYY-MM-DD[T]HH:mm:ss');
    time.end = moment($('.filter.end-time').val()).tz('America/Los_Angeles').format('YYYY-MM-DD[T]HH:mm:ss'); // Using relative dates
  } else {
    const relativeSelector = $('.relative-date-selector').val();

    if (relativeSelector == 'today') {
      time.start = moment().format('YYYY-MM-DD') + 'T00:00:00';
      time.end = moment().format('YYYY-MM-DD') + 'T23:59:59'; // If user specified a certain number of minutes, subtract the minutes,
      // convert to Eastern Time, and round down to nearest 30-minute interval
    } else if (relativeSelector == 'last-x-minutes') {
      const minutes = $('.filter.relative-minutes').val();
      if (isNaN(minutes)) throw new Error(`Relative minute value ${minutes} is not a number.`); // Convert to server's timezone

      let start = moment().subtract(minutes, 'm').tz('America/Los_Angeles'); // round down to nearest interval

      start.subtract(start.minutes() % 30, 'minutes');
      start.seconds(0);
      time.start = start.format('YYYY-MM-DD[T]HH:mm:ss');
      console.log(time.start);
      time.end = moment().format('YYYY-MM-DD') + 'T23:59:59';
    } else {
      throw new Error('Relative date selector value is ' + relativeSelector + '. Value not recognized.');
    }
  }

  return time;
}

/***/ }),

/***/ 76:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__local_settings__ = __webpack_require__(1);
 // Map of U.S. with ZIP3 areas colored by calls offered.
// Offers methods to create/draw the map and update when new data is received.

class CallMap {
  /**
   * Create and draw map on initial run
   * @param  {Object}  data d3.nest data object with zipcode as key and fields as values
   * @param  {String}  field to map (calls or callsPerCustomer)
   * @return {Promise} resolves when complete
   */
  create(data, field) {
    // Taken from d3.schemeBlues[9]
    this.colors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];
    let width = 960,
        height = 500;
    this.calls = d3.map(data, d => d.key);
    let minValue = d3.min(data, d => d.value[field]);
    let maxValue = d3.max(data, d => d.value[field]);
    this.x = d3.scaleLinear().domain(d3.extent(data, d => d.value[field])).rangeRound([600, 860]);
    this.color = d3.scaleThreshold().domain(d3.range(0, maxValue, maxValue / 9)).range(this.colors);
    this.path = d3.geoPath();
    this.svg = d3.select('svg').attr('width', width).attr('height', height); // Key / legend

    this.keyTitle = 'Calls offered';
    this.drawKey(this.x, this.color);
    return d3.queue().defer(d3.json, __WEBPACK_IMPORTED_MODULE_0__local_settings__["a" /* API_URL */] + 'states').defer(d3.json, __WEBPACK_IMPORTED_MODULE_0__local_settings__["a" /* API_URL */] + 'zip3-data').await((err, usa, zipData) => this.onReady(err, usa, zipData, field));
  } // Assign initial variables when map is first created and topographic
  // data is first loaded


  onReady(err, usa, zipData, field) {
    this.zipData = zipData;
    this.usa = usa;
    this.drawZips(zipData, field);
    this.drawStates(usa);
  } // Update map with new data


  async update(data, field) {
    // Check if this chart already exists. If not, create it.
    if (!this.svg) return this.create(data, field); // match calls to keys (zip codes)

    this.calls = d3.map(data, d => d.key); // update domain and range

    let max = d3.max(data, d => d.value[field]);
    this.x.domain(d3.extent(data, d => d.value[field]));
    this.color.domain(d3.range(0, max, max / 9)); // Key / legend
    // remove then redraw the color key

    this.g.remove().exit();
    this.drawKey(this.x, this.color); // data - paint the state lines and zip codes
    // clear old states and zips

    this.svg.selectAll('.zips, .states').remove().exit(); // then rebuild them

    this.drawZips(this.zipData, field);
    this.drawStates(this.usa);
  } // Draw ZIP3 areas, colored by number of calls
  // ${zipData} is GeoJSON describing the topography


  drawZips(zipData, field) {
    let backgroundColor = '#feffff'; // Sort so that areas with call data are drawn last and end up on top

    let sorted = zipData.features.sort((a, b) => {
      if (this.isEmptyZip(a.properties.ZIP, field)) return -1;
      return 1;
    });
    this.svg.insert('g', '.key').attr('class', 'zips').selectAll('path').data(sorted).enter().append('path').attr('d', this.path).attr('fill', d => {
      let zip = d.properties.ZIP;
      if (this.isEmptyZip(zip, field)) return backgroundColor;
      return this.color(this.calls.get(zip).value[field]);
    }).attr('stroke', d => {
      let zip = d.properties.ZIP;
      if (this.isEmptyZip(zip, field)) return backgroundColor;
      return 'hsla(208, 30%, 60%, 0.5)';
    }).append('title').text(d => {
      let zip = d.properties.ZIP;
      let o = {
        calls: 0,
        customers: 0,
        callsPerCustomer: 0
      };

      if (this.calls.has(zip)) {
        o = this.calls.get(zip).value;
      }

      return `ZIP3: ${zip}\nCalls: ${o.calls}\nCustomers: ${o.customers}\nCalls divided by customer count: ${d3.format(".2%")(o.callsPerCustomer)}`;
    });
  }
  /**
   * Returns true if the zip code is not in the data or has a value equal to 0
   * @param  {String}  zip   zip code
   * @param  {String}  field to check in this.calls.value
   * @return {Boolean}
   */


  isEmptyZip(zip, field) {
    return !this.calls.has(zip) || this.calls.get(zip).value[field] == 0;
  } // Draw the state outlines


  drawStates(usa) {
    this.svg.insert('g', '.key').attr('class', 'states').selectAll('path').data(usa.features).enter().append('path').attr('d', this.path);
  } // Draw the key/legend


  drawKey(x, color) {
    this.g = this.svg.append('g').attr('class', 'key').attr('transform', 'translate(0,40)');
    this.g.selectAll('rect').data(color.range().map(d => {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    })).enter().append('rect').attr('height', 8).attr('x', d => x(d[0])).attr('width', d => {
      return Math.abs(x(d[1]) - x(d[0]));
    }).attr('fill', d => color(d[0]));
    this.g.append('text').attr('class', 'caption').attr('x', x.range()[0]).attr('y', -6).attr('fill', '#444').attr('text-anchor', 'start').attr('font-weight', 'bold').text(this.keyTitle);
    this.g.call(d3.axisBottom(x).tickSize(13).tickFormat(this.formatLegend).tickValues(color.domain())).select('.domain').remove();
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = CallMap;


/***/ })

/******/ });
//# sourceMappingURL=map.js.map