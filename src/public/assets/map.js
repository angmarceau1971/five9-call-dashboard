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
/******/ 	return __webpack_require__(__webpack_require__.s = 113);
/******/ })
/************************************************************************/
/******/ ({

/***/ 113:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(114);


/***/ }),

/***/ 114:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__maps__ = __webpack_require__(115);


 // General functions to initiate the call map dashboard.
// Uses the CallMap class defined in maps.js to draw the D3 map.
// timeout to pause event loop when needed

let timeout = null;
const mapSettings = {
  display: 'total'
};
$(document).ready(() => {
  let callMap = new __WEBPACK_IMPORTED_MODULE_2__maps__["a" /* default */](); // listen for update button presses

  $('.filters-wrapper .update').click(async event => {
    // stop any current event loops running
    if (timeout != null) {
      clearTimeout(timeout);
    } // Update map every 4 minutes


    startUpdatingMap(callMap, 4 * 60);
  }); // Listen for changes to the filter settings

  setupFilterListeners(); // Start updating on page load

  $('.filters-wrapper .update').trigger('click');
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
  const callData = await __WEBPACK_IMPORTED_MODULE_1__api__["q" /* getReportResults */](params, 'maps'); // build data object off of customerData zip codes

  let data = Object.keys(customerData).map(zip => ({
    zipCode: zip,
    calls: callData.filter(d => d.zipCode == zip).reduce((sum, d) => sum + d.calls, 0),
    customers: customerData[zip]
  })); // if any zips with calls are missing from customerData, add them here

  let missing = getZipsWithoutCustomers(callData, customerData);
  data = data.concat(missing); // Determine the field being mapped -- total calls or per customer

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
    let rawData = await __WEBPACK_IMPORTED_MODULE_1__api__["q" /* getReportResults */]({}, 'customers'); // Convert array of objects to a single object, with zipcode as key
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
  return callData.filter(d => isZipWithoutCustomers(d.zipCode, customerData)).map(d => ({
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

/***/ 115:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__local_settings__ = __webpack_require__(7);
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


/***/ }),

/***/ 5:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["t"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["x"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["q"] = getReportResults;
/* harmony export (immutable) */ __webpack_exports__["p"] = getLookerData;
/* harmony export (immutable) */ __webpack_exports__["o"] = getLogs;
/* harmony export (immutable) */ __webpack_exports__["v"] = getUserInformation;
/* harmony export (immutable) */ __webpack_exports__["I"] = updateUserTheme;
/* harmony export (immutable) */ __webpack_exports__["g"] = getAdminUsers;
/* harmony export (immutable) */ __webpack_exports__["A"] = updateAdminUser;
/* harmony export (immutable) */ __webpack_exports__["u"] = getSupervisorUsers;
/* harmony export (immutable) */ __webpack_exports__["H"] = updateSupervisorUser;
/* harmony export (immutable) */ __webpack_exports__["w"] = getUsers;
/* harmony export (immutable) */ __webpack_exports__["i"] = getFieldList;
/* harmony export (immutable) */ __webpack_exports__["C"] = updateField;
/* harmony export (immutable) */ __webpack_exports__["b"] = deleteField;
/* harmony export (immutable) */ __webpack_exports__["j"] = getGoalList;
/* harmony export (immutable) */ __webpack_exports__["k"] = getGoalsForAgentGroups;
/* harmony export (immutable) */ __webpack_exports__["D"] = updateGoal;
/* harmony export (immutable) */ __webpack_exports__["c"] = deleteGoal;
/* harmony export (immutable) */ __webpack_exports__["l"] = getLayout;
/* harmony export (immutable) */ __webpack_exports__["m"] = getLayoutList;
/* harmony export (immutable) */ __webpack_exports__["E"] = updateLayout;
/* harmony export (immutable) */ __webpack_exports__["d"] = deleteLayout;
/* harmony export (immutable) */ __webpack_exports__["h"] = getDatasources;
/* harmony export (immutable) */ __webpack_exports__["B"] = updateDatasource;
/* harmony export (immutable) */ __webpack_exports__["a"] = deleteDatasource;
/* harmony export (immutable) */ __webpack_exports__["r"] = getSkillGroups;
/* harmony export (immutable) */ __webpack_exports__["n"] = getLinkList;
/* harmony export (immutable) */ __webpack_exports__["F"] = updateLink;
/* harmony export (immutable) */ __webpack_exports__["e"] = deleteLink;
/* harmony export (immutable) */ __webpack_exports__["s"] = getSkillJobs;
/* harmony export (immutable) */ __webpack_exports__["G"] = updateSkillJob;
/* harmony export (immutable) */ __webpack_exports__["f"] = deleteSkillJob;
/* harmony export (immutable) */ __webpack_exports__["y"] = rebootServer;
/* harmony export (immutable) */ __webpack_exports__["z"] = reloadData;
/* harmony export (immutable) */ __webpack_exports__["J"] = uploadData;
/* unused harmony export getParameters */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__local_settings_js__ = __webpack_require__(7);

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
 * @return {Promise -> Object}        JSON data
 */

function getReportResults(params, type) {
  return getData(params, `reports/${type}`);
}
/**
 * Pull Looker data from given Look
 * @param  {String} lookId
 * @return {Object} JSON data
 */

async function getLookerData(lookId) {
  let response = await request({
    lookId: lookId
  }, 'looker');
  return await response.json();
}
async function getLogs(query) {
  let response = await request({
    query: query
  }, 'logs');
  return await response.json();
} ///////////////////////////////////////////////////////////////////////
// Users

/**
 * Return user information from username.
 * @param  {String} username if blank, will return currently logged-in user's
 *                           data
 * @return {Promise -> Object} User's object
 */

async function getUserInformation(username = '') {
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

async function updateUserTheme(username, newTheme) {
  const response = await request({
    username: username,
    newTheme: newTheme
  }, `users/theme`, 'PATCH');
  return response.text();
} // Admin users

async function getAdminUsers() {
  let response = await request({}, 'users/admin', 'GET');
  let users = await response.json();
  console.log(users);
  return users;
}
async function updateAdminUser(user) {
  let response = await request({
    user: user
  }, 'users/admin', 'PATCH');
  return response.text();
} // Supervisor users

async function getSupervisorUsers() {
  let response = await request({}, 'users/supervisor', 'GET');
  let users = await response.json();
  console.log(users);
  return users;
}
async function updateSupervisorUser(user) {
  let response = await request({
    user: user
  }, 'users/supervisor', 'PATCH');
  return response.text();
} // Get list of all users

async function getUsers() {
  let response = await request({}, 'users', 'GET');
  return response.json();
} ///////////////////////////////////////////////////////////////////////
// Fields

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
 * Delete a field from server.
 * @param  {Object}  field object to remove
 * @return {Promise} resolves to response message
 */

async function deleteField(field) {
  let response = await request({
    field: field
  }, 'fields', 'DELETE');
  return response.text();
} ///////////////////////////////////////////////////////////////////////
// Goals

/**
 * List of all goals.
 * @return {Promise} resolves to array of goal objects
 */

async function getGoalList() {
  let response = await request({}, 'goals', 'POST');
  return response.json();
}
/**
 * List of goals that apply to the given agent group(s).
 * @param  {Array of Strings}   agentGroups
 * @return {Promise} resolves to array of goal objects
 */

async function getGoalsForAgentGroups(agentGroups) {
  let response = await request({
    agentGroups: agentGroups
  }, 'goals', 'POST');
  return response.json();
}
/**
 * Updates a goal on server.
 * @param  {Object}  goal new object
 * @return {Promise} resolves to response message
 */

async function updateGoal(goal) {
  let response = await request({
    goal: goal
  }, 'goals', 'PUT');
  return response.text();
}
/**
 * Delete a goal from server.
 * @param  {Object}  goal object to remove
 * @return {Promise} resolves to response message
 */

async function deleteGoal(goal) {
  let response = await request({
    goal: goal
  }, 'goals', 'DELETE');
  return response.text();
} ///////////////////////////////////////////////////////////////////////
// Layouts

/**
 * Get scorecard JSON layout for given agent group(s) and type.
 * @param  {Array of Strings} agentGroups user's agent groups
 * @param  {String} type either team or individual layout
 * @return {Object}
 */

async function getLayout(agentGroups, type) {
  let response = await request({
    agentGroups: agentGroups,
    type: type
  }, 'layout');
  return await response.json();
}
/**
 * List of all layouts.
 * @return {Promise} resolves to array of layout objects
 */

async function getLayoutList() {
  let response = await request({}, 'layouts', 'POST');
  return response.json();
}
/**
 * Updates a layout on server.
 * @param  {Object}  layout new object
 * @return {Promise} resolves to response message
 */

async function updateLayout(layout) {
  let response = await request({
    layout: layout
  }, 'layouts', 'PUT');
  return response.text();
}
/**
 * Delete a layout from server.
 * @param  {Object}  layout object to remove
 * @return {Promise} resolves to response message
 */

async function deleteLayout(layout) {
  let response = await request({
    layout: layout
  }, 'layouts', 'DELETE');
  return response.text();
} ///////////////////////////////////////////////////////////////////////
// Datasources' settings

/**
 * List of all datasources.
 * @return {Promise} resolves to array of datasource objects
 */

async function getDatasources() {
  let response = await request({}, 'datasources', 'GET');
  return response.json();
}
/**
 * Updates a datasource on server.
 * @param  {Object}  datasource new object
 * @return {Promise} resolves to response message
 */

async function updateDatasource(datasource) {
  let response = await request({
    datasource: datasource
  }, 'datasources', 'PUT');
  return response.text();
}
/**
 * Delete a datasource from server.
 * @param  {Object}  datasource object to remove
 * @return {Promise} resolves to response message
 */

async function deleteDatasource(datasource) {
  let response = await request({
    datasource: datasource
  }, 'datasources', 'DELETE');
  return response.text();
}
/**
 * Get skill groups with associated names, agentGroups and skills
 * @return {Promise -> [Object]} array of objects from SkillGroup table
 */

async function getSkillGroups() {
  let response = await request({}, 'skill-group', 'GET');
  return response.json();
} ///////////////////////////////////////////////////////////////////////
// 'Helpful Links'

/**
 * List of all links.
 * @return {Promise} resolves to array of link objects
 */

async function getLinkList() {
  let response = await request({}, 'links', 'POST');
  return response.json();
}
/**
 * Updates a link on server.
 * @param  {Object}  link new object
 * @return {Promise} resolves to response message
 */

async function updateLink(link) {
  let response = await request({
    link: link
  }, 'links', 'PUT');
  return response.text();
}
/**
 * Delete a link from server.
 * @param  {Object}  link object to remove
 * @return {Promise} resolves to response message
 */

async function deleteLink(link) {
  let response = await request({
    link: link
  }, 'links', 'DELETE');
  return response.text();
} ///////////////////////////////////////////////////////////////////////
// Skilling jobs

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
  // format data
  const format = skillStr => skillStr.split(',').map(sk => sk.trim());

  ['addSkills', 'removeSkills'].map(prop => {
    let skills = job.data[prop];

    if (typeof skills == 'string') {
      job.data[prop] = format(skills);
    }
  });
  let response = await request({
    job: job,
    data: job.data
  }, 'skill', 'PUT');
  return response.text();
}
/**
 * Delete the given skilling job object.
 * @param  {Object} job
 * @return {Promise} resolves to response from server
 */

async function deleteSkillJob(job) {
  let response = await request({
    job: job
  }, 'skill', 'DELETE');
  return response.text();
} ///////////////////////////////////////////////////////////////////////
// Server utilities

async function rebootServer() {
  const response = await request({}, 'reboot-server', 'POST');
  return response.text();
}
async function reloadData(params) {
  const response = await request(params, 'reload-data', 'POST');
  return response.text();
}
/**
 * Upload CSV file to custom data source.
 * @param  {Object} params including fields datasourceName and csv
 * @return {Promise}       resolves to string (server response message)
 */

async function uploadData(params) {
  try {
    const response = await request(params, 'upload-data', 'POST');
    return await response.text();
  } catch (err) {
    return err.message;
  }
} ///////////////////////////////////////////////////////////////////////
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
  }

  return params;
}

/***/ }),

/***/ 6:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = error;
/* harmony export (immutable) */ __webpack_exports__["b"] = formatAMPM;
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
}

/***/ }),

/***/ 7:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'http://localhost:3000/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ })

/******/ });
//# sourceMappingURL=map.js.map