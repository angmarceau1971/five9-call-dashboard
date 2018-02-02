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
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'http://localhost:3000/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["e"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["f"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["c"] = getReportResults;
/* harmony export (immutable) */ __webpack_exports__["b"] = getFieldList;
/* harmony export (immutable) */ __webpack_exports__["g"] = updateField;
/* harmony export (immutable) */ __webpack_exports__["d"] = getSkillJobs;
/* harmony export (immutable) */ __webpack_exports__["h"] = updateSkillJob;
/* harmony export (immutable) */ __webpack_exports__["a"] = deleteSkillJob;
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
async function deleteSkillJob(job) {
  let response = await request({
    job: job
  }, 'skill', 'DELETE');
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
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(7)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction) {
  isProduction = _isProduction

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[data-vue-ssr-id~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var _isPlaceholder = /*#__PURE__*/__webpack_require__(20);

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}
module.exports = _curry1;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 8 */,
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_widget_base_vue__ = __webpack_require__(33);
var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_widget_base_vue__["a" /* default */],
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\widget-base.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1add60b1", Component.options)
  } else {
    hotAPI.reload("data-v-1add60b1", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = formatValue;
let comparators = {
  '>=': (value, goal) => value >= goal,
  '<=': (value, goal) => value <= goal
};
function formatValue(value, field) {
  let formattedValue, style;

  if (!field) {
    return {
      value: value,
      styleClass: ''
    };
  }

  if (field.hasGoal) {
    style = comparators[field.comparator](value, field.goal) ? 'green' : 'red';
  } else {
    style = '';
  }

  if (field.format.type == 'Number') {
    formattedValue = d3.format(field.format.string)(value);
  } else if (field.format.type == 'Time') {
    formattedValue = moment('2018-01-01').startOf('day').seconds(value).format(field.format.string);
  } else {
    formattedValue = value;
  }

  return {
    value: formattedValue,
    styleClass: style
  }; // let format, styleClass;
  // switch(field) {
  //     case 'Date':
  //         format = (val) => moment(val).format('MMM D');
  //         styleClass = (val) => '';
  //         break;
  //
  //     case 'Close Rate':
  //         format = (val) => isNaN(val)
  //                         ? 'N/A'
  //                         : (val * 100).toFixed(0) + '%';
  //         styleClass = (val) => isNaN(val)
  //                         ? ''
  //                         : val >= 0.5 ? 'green' : 'red';
  //         break;
  //
  //     case 'AHT':
  //         format = (val) => val;
  //         styleClass = (val) => {
  //             if (val == 'N/A') return '';
  //             return moment(val, 'mm:ss').valueOf() <= moment('10:00', 'mm:ss').valueOf()
  //                     ? 'green' : 'red';
  //         };
  //         break;
  //
  //     default:
  //         format = (val) => val;
  //         styleClass = (val) => '';
  //         break;
  // };
  // return { value: format(value), styleClass: styleClass(value) };
}
;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
module.exports = _has;

/***/ }),
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = clean;
/* harmony export (immutable) */ __webpack_exports__["b"] = dateOptions;
/* unused harmony export prettifyDateOption */
const clone = __webpack_require__(18);
/**
 * Returns a cleaned / formatted copy of widget filter to pass to server.
 * @param  {Object} original    filter from widget
 * @param  {String} currentUser current user's username
 * @return {Object}             cleaned up filter for server
 */


function clean(original, currentUser) {
  let filter = clone(original); // Clean up dates

  let dateFn = dateMatcher[filter.date];
  filter.dateDay = dateFn(); // @todo - may want datetimes

  delete filter.date; // Insert actual username

  if (filter.agentUsername.$in.includes('<current user>')) {
    filter.agentUsername.$in[filter.agentUsername.$in.indexOf('<current user>')] = currentUser;
  }

  return filter;
}
function dateOptions() {
  return Object.keys(dateMatcher);
}
function prettifyDateOption(option) {
  // remove brackets
  option.replace(/[<|>]/, ''); // TODO: capitalize properly

  return option;
}
const dateMatcher = {
  '<today>': function () {
    return {
      $gte: moment().startOf('day').toDate(),
      $lt: moment().endOf('day').toDate()
    };
  },
  '<yesterday>': function () {
    return {
      $gte: moment().add(-1, 'days').startOf('day').toDate(),
      $lt: moment().startOf('day').toDate()
    };
  },
  '<month-to-date>': function () {
    return {
      $gte: moment().startOf('month').toDate(),
      $lt: moment().endOf('month').toDate()
    };
  }
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var _clone = /*#__PURE__*/__webpack_require__(38);

var _curry1 = /*#__PURE__*/__webpack_require__(6);

/**
 * Creates a deep copy of the value which may contain (nested) `Array`s and
 * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
 * assigned by reference rather than copied
 *
 * Dispatches to a `clone` method if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {*} -> {*}
 * @param {*} value The object or array to clone
 * @return {*} A deeply cloned copy of `val`
 * @example
 *
 *      var objects = [{}, {}, {}];
 *      var objectsClone = R.clone(objects);
 *      objects === objectsClone; //=> false
 *      objects[0] === objectsClone[0]; //=> false
 */


var clone = /*#__PURE__*/_curry1(function clone(value) {
  return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, [], [], true);
});
module.exports = clone;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(6);

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */


var type = /*#__PURE__*/_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});
module.exports = type;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

function _isPlaceholder(a) {
       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}
module.exports = _isPlaceholder;

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_data_table_vue__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_48d3d2c4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_data_table_vue__ = __webpack_require__(47);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(41)
}
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_data_table_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_48d3d2c4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_data_table_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\data-table.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-48d3d2c4", Component.options)
  } else {
    hotAPI.reload("data-v-48d3d2c4", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = sortOrder;
/**
 * Compares card or widget positions and determine which one should be placed first.
 * Used when re-ordering cards/widgets after drag-and-drop operations.
 * Objects are ordered based on their DOM elements:
 *      1)  Top: elements higher up on page go first
 *      2)  Left: elements on the left side go first
 * For the object that was dropped, the mouse's Y & X values are used instead
 * of the top & left of the associated element.
 *
 * @param  {Object} a       widget or card object
 * @param  {Object} b       widget or card object
 * @param  {String} dropId  ID of element that was dropped
 * @param  {Function} el    takes a or b object and returns DOM element
 * @return {Integer}        Order for sort function: -1 if a first,
 *                          +1 if b first, 0 if tied.
 */
function sortOrder(a, b, event, dropId, el) {
  let left = x => el(x).offsetLeft;

  let top = x => el(x).offsetTop;

  let bottom = x => top(x) + el(x).clientHeight; // If neither element is the dropped card, compare positions


  if (a.id != dropId && b.id != dropId) {
    if (top(a) < top(b)) {
      return -1;
    } else if (top(b) < top(a)) {
      return +1;
    }

    return left(a) < left(b) ? -1 : +1;
  } // If card `a` is selected...


  if (a.id == dropId) {
    // move forward if it's below the bottom of `b`
    if (event.pageY > bottom(b)) {
      return 1;
    } // move forward if it's below the top of `b` and to the
    // of `b`


    if (event.pageY > top(b) && event.pageX > left(b)) {
      return 1;
    } // otherwise, let card `b` move ahead


    return -1;
  } // ...If card `b` was selected, do the same.


  if (b.id == dropId) {
    if (event.pageY > bottom(a)) {
      return -1;
    }

    if (event.pageY > top(a) && event.pageX > left(a)) {
      return -1;
    }

    return 1;
  }
}
;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var _has = /*#__PURE__*/__webpack_require__(11);

var toString = Object.prototype.toString;
var _isArguments = function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
};

module.exports = _isArguments;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(6);

var _isPlaceholder = /*#__PURE__*/__webpack_require__(20);

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}
module.exports = _curry2;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(26);


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_dashboard_vue__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__hub__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__scorecard_format__ = __webpack_require__(10);


 // Node libraries

const isEmpty = __webpack_require__(65);

const aht = {
  title: 'Average Handle Time',
  id: 'card:1',
  layoutOrder: 1,
  columns: 1
};
aht.data = [];
aht.widgets = [{
  'id': 'widget:0',
  'component': 'single-value',
  'title': 'Today',
  'fieldName': 'AHT',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<today>'
  }
}, {
  'id': 'widget:1',
  'component': 'single-value',
  'title': 'Month to Date',
  'fieldName': 'AHT',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<month-to-date>'
  }
}, {
  'id': 'widget:2',
  'component': 'single-value',
  'title': 'ACW Today',
  'fieldName': 'ACW',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<today>'
  }
}, {
  'id': 'widget:3',
  'component': 'single-value',
  'title': 'ACW Month to Date',
  'fieldName': 'ACW',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<month-to-date>'
  }
}];
const calls = {
  title: 'Calls Handled',
  id: 'card:2',
  layoutOrder: 2,
  columns: 1
};
calls.data = [];
calls.widgets = [{
  'id': 'widget:0',
  'component': 'single-value',
  'title': 'Today',
  'fieldName': 'calls',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<today>'
  }
}, {
  'id': 'widget:1',
  'component': 'single-value',
  'title': 'Month to Date',
  'fieldName': 'calls',
  'filter': {
    agentUsername: {
      $in: ['<current user>']
    },
    date: '<month-to-date>'
  }
}];
const layout = {
  cards: [aht, calls]
};
const datasources = {
  'DIRECTV': {
    fields: ['DTV Sales', 'Rolling Total', 'Pacing', 'Delta'],
    refreshRate: 24 * 3600 // daily

  },
  'AHT': {
    fields: ['handleTime', 'calls']
  }
};
const dataValues = {
  'AHT': []
};
Vue.use(Vuex);
const store = __WEBPACK_IMPORTED_MODULE_1__hub__["a" /* store */];
const vm = new Vue({
  el: '#app',
  store,
  data: {
    layout: layout,
    datasources: datasources,
    dataValues: dataValues
  },
  components: {
    'dashboard': __WEBPACK_IMPORTED_MODULE_0__components_dashboard_vue__["a" /* default */]
  },
  computed: {
    user: {
      get() {
        return this.$store.state.currentUser;
      },

      set(value) {
        this.$store.commit('updateUser', value);
      }

    }
  },

  beforeMount() {
    this.postAcd();
  },

  methods: {
    postAcd: async function () {
      return store.dispatch('startUpdating');
    },
    clickImport: function () {
      this.$refs.fileInput.click();
    },
    importLayout: function (event) {
      const file = event.target.files[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        const contents = JSON.parse(e.target.result);
        console.log(contents);
        this.layout = Object.assign({}, contents);
      }.bind(this);

      reader.readAsText(file);
    },
    exportLayout: function () {
      download(layout, 'test.json', 'text/plain');
    },
    addCard: function () {
      const newCard = {
        title: 'card:' + this.layout.cards.length,
        id: 'card:' + this.layout.cards.length,
        layoutOrder: -1,
        data: [],
        widgets: []
      };
      console.log(newCard);
      this.layout.cards.push(newCard);
    },
    updateLayout: function (newLayout) {
      Object.assign(this.layout, newLayout);
    },
    updateCard: function (cardId, newCard) {
      let oldCardIndex = this.layout.cards.findIndex(card => card.id == cardId);
      let oldCard = this.layout.cards[oldCardIndex]; // Create a new card object that has all properties from the
      // new card and the old one (to include properties that aren't
      // defined in `newCard`)

      let newCardComplete = Object.assign({}, oldCard, newCard); // Use `Vue.set` to trigger reactivity
      // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats

      Vue.set(this.layout.cards, oldCardIndex, newCardComplete);
    },
    deleteCard: function (cardId) {
      let cardIndex = this.layout.cards.findIndex(card => card.id == cardId);
      Vue.delete(this.layout.cards, cardIndex);
    },

    /**
     * Update a widget. If newWidget is an empty object ({}), delete the
     * old widget.
     * @param  {Object} newWidget object to replace old widget with
     * @param  {String} widgetId
     * @param  {String} cardId    ID for container card
     * @return
     */
    modifyWidget: function (newWidget, widgetId, cardId) {
      let card = this.layout.cards.find(c => c.id == cardId);
      let oldWidgetIndex = card.widgets.findIndex(w => w.id == widgetId);
      let oldWidget = card.widgets[oldWidgetIndex];

      if (isEmpty(newWidget)) {
        Vue.delete(card.widgets, oldWidgetIndex);
      } else {
        // see updateCard function for explanation
        let newWidgetComplete = Object.assign({}, oldWidget, newWidget);
        Vue.set(card.widgets, oldWidgetIndex, newWidgetComplete);
      }
    }
  }
});

function download(text, name, type) {
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(text, null, 2)], {
    type: type
  });
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_dashboard_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c21f7d6a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_dashboard_vue__ = __webpack_require__(62);
var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_dashboard_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c21f7d6a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_dashboard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\dashboard.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c21f7d6a", Component.options)
  } else {
    hotAPI.reload("data-v-c21f7d6a", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__card_vue__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__card_editor_vue__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__drag_n_drop_sort_js__ = __webpack_require__(22);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['layout'],
  components: {
    'card': __WEBPACK_IMPORTED_MODULE_0__card_vue__["a" /* default */],
    'card-editor': __WEBPACK_IMPORTED_MODULE_1__card_editor_vue__["a" /* default */]
  },
  data: function () {
    return {
      editingCard: false,
      editedCard: null
    };
  },
  methods: {
    // Edit or delete a card
    editCard: function (cardId) {
      this.editingCard = true;
      this.editedCard = this.layout.cards.find(card => card.id == cardId); // close modal on click outside window

      document.documentElement.addEventListener('click', function (ev) {
        if (!this.$el.contains(ev.target)) this.exitEdit(false);
      }.bind(this), false);
    },
    exitEdit: function (saveChanges, cardId, card) {
      this.editingCard = false;
      this.editedCard = '';
      if (!saveChanges) return;
      this.$emit('update-card', cardId, card);
    },
    deleteCard: function (cardId) {
      this.exitEdit(false);
      this.$emit('delete-card', cardId);
    },

    /**
     * Modify a single widget.
     * @param  {Object} newWidget object to replace old widget with
     * @param  {String} widgetId  id of widget within card
     * @param  {String} cardId    id of card containing widget
     * @emits  modify-widget event to app Vue instance
     */
    modifyWidget: function (newWidget, widgetId, cardId) {
      this.$emit('modify-widget', newWidget, widgetId, cardId);
    },

    /**
     * Update all widgets. Used to change order of widgets after drag and
     * drop actions.
     * @param  {Array}  newWidgets all of the new widgets
     * @param  {String} cardId     card that is being modified
     * @emits  update-card Event to app's Vue instance
     */
    updateWidgets: function (newWidgets, cardId) {
      let newCard = {};
      Object.assign(newCard, this.layout.cards[cardId]);
      newCard.widgets = newWidgets;
      this.$emit('update-card', cardId, newCard);
    },
    // Drag and drop to move cards
    dragoverHandler: function (event) {
      if (!this.$store.state.editMode) return;
      event.preventDefault();
    },
    dropHandler: function (event) {
      if (!this.$store.state.editMode) return;
      const id = event.dataTransfer.getData('text');
      const thisCard = this.$refs[id][0];
      let newLayout = [];
      Object.assign(newLayout, this.layout); // Determine what order the cards should be in

      let el = card => this.$refs[card.id][0].$el;

      newLayout.cards.sort((a, b) => Object(__WEBPACK_IMPORTED_MODULE_2__drag_n_drop_sort_js__["a" /* sortOrder */])(a, b, event, id, el)); // Update the layoutOrder property for each card

      newLayout.cards.forEach((card, i) => {
        card.layoutOrder = i;
      }); // Update the layout

      this.$emit('update-layout', newLayout);
    }
  }
});

/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_card_vue__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3bec8029_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_card_vue__ = __webpack_require__(56);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(30)
}
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_card_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3bec8029_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_card_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\card.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3bec8029", Component.options)
  } else {
    hotAPI.reload("data-v-3bec8029", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(31);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("4911ebf4", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3bec8029\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./card.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3bec8029\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./card.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "\n.card {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    grid-gap: 3em;\n}\r\n\r\n/* Since the card's grid determines margins, remove margins from the first\r\n * child of each widget.\r\n*/\n.card > .widget > *:first-child {\r\n    margin-top: 0em;\n}\n.card {\r\n    transition: all 1s;\r\n    padding: 0.5em;\n}\r\n\r\n/* Buttons to edit card and/or add widgets */\n.card .edit-button,\r\n.card .add-button {\r\n    display: inline;\r\n    text-decoration: none;\r\n    position: absolute;\r\n    font-size: 1.25em;\r\n    color: #fff;\r\n    margin: 4%;\r\n    width: 2em;\r\n    height: 2em;\r\n    align-content: center;\r\n    justify-content: center;\r\n    background-color: rgba(100,100,100,0.5);\r\n    border-radius: 2em;\n}\n.card .edit-button:hover,\r\n.card .add-button:hover {\r\n    background-color: rgba(100,100,100,0.3);\n}\n.card .edit-button {\r\n    top: 0;\r\n    left: 0;\n}\n.card .add-button {\r\n    top: 0;\r\n    right: 0;\n}\r\n\r\n", "", {"version":3,"sources":["C:/Users/nclonts/Documents/Rise/dashboard/five9-call-dashboard/src/public/components/src/public/components/card.vue?6b127548"],"names":[],"mappings":";AA8LA;IACA,cAAA;IACA,2BAAA;IACA,cAAA;CACA;;AAEA;;EAEA;AACA;IACA,gBAAA;CACA;AACA;IACA,mBAAA;IACA,eAAA;CACA;;AAEA,6CAAA;AACA;;IAEA,gBAAA;IACA,sBAAA;IACA,mBAAA;IACA,kBAAA;IACA,YAAA;IACA,WAAA;IACA,WAAA;IACA,YAAA;IACA,sBAAA;IACA,wBAAA;IACA,wCAAA;IACA,mBAAA;CACA;AACA;;IAEA,wCAAA;CACA;AACA;IACA,OAAA;IACA,QAAA;CACA;AACA;IACA,OAAA;IACA,SAAA;CACA","file":"card.vue","sourcesContent":["/**\r\n * Container for widget components.\r\n * Contains various functionality:\r\n *  - Handles drag and drop events for each widget within it\r\n *  - Can be dragged around other cards by dragging the title h2 (this is handled\r\n *      in the Dashboard component, Card's parent)\r\n *  - When widgets are modified, Card receives `modify-widget` events and bubbles\r\n *      them up to the parent Dashboard\r\n */\r\n\r\n<template>\r\n<div class=\"card metric-wrapper stats-box\"\r\n    :id=\"id\"\r\n    :style=\"gridPositioning\"\r\n    @dragover=\"dragWidgetHandler\" @drop=\"dropWidgetHandler\">\r\n\r\n    <!-- Card is draggable by the title -->\r\n    <h2 class=\"title descriptor\"\r\n        :draggable=\"$store.state.editMode\"\r\n        @dragstart=\"dragstartHandler\">{{ title }}</h2>\r\n\r\n    <button v-if=\"$store.state.editMode\"\r\n        class=\"edit-button\"\r\n        @click=\"$emit('edit-card', id)\"\r\n    >&#9776;</button>\r\n    <button v-if=\"$store.state.editMode\"\r\n        class=\"add-button\"\r\n        @click=\"addWidget\"\r\n    >+</button>\r\n\r\n\r\n    <!-- Widget components -->\r\n    <single-value class=\"widget\"\r\n        v-for=\"(widget, i) in widgetsOfType('single-value')\"\r\n        v-bind=\"widget\"\r\n        :key=\"widget.id\"\r\n        :ref=\"widget.id\"\r\n        :style=\"{ order: widget.layoutOrder }\"\r\n        @dragstart-widget=\"dragstartWidgetHandler\"\r\n        @modify-widget=\"modifyWidget\"\r\n    ></single-value>\r\n\r\n    <line-graph class=\"widget\"\r\n        v-for=\"(widget, i) in widgetsOfType('line-graph')\"\r\n        v-bind=\"widget\"\r\n        :data=\"data\"\r\n        :key=\"widget.id\"\r\n        :ref=\"widget.id\"\r\n        :style=\"{ order: widget.layoutOrder }\"\r\n        @dragstart-widget=\"dragstartWidgetHandler\"\r\n    ></line-graph>\r\n\r\n    <data-table class=\"widget\"\r\n        v-for=\"(widget, i) in widgetsOfType('data-table')\"\r\n        v-bind=\"widget\"\r\n        :data=\"data\"\r\n        :highlightedDate=\"highlightedDate\"\r\n        :key=\"widget.id\"\r\n        :ref=\"widget.id\"\r\n        :style=\"{ order: widget.layoutOrder }\"\r\n        @hoverDate=\"hoverDate\"\r\n        @unhoverDate=\"unhoverDate\"\r\n        @dragstart-widget=\"dragstartWidgetHandler\"\r\n    ></data-table>\r\n</div>\r\n</template>\r\n\r\n\r\n<script>\r\nimport WidgetBase from './widget-base.vue';\r\nimport DataTable from './data-table.vue';\r\nimport LineGraph from './line-graph.vue';\r\nimport SingleValue from './single-value.vue';\r\nimport { formatValue } from '../javascript/scorecard-format';\r\nimport { sortOrder } from './drag-n-drop-sort.js';\r\n\r\nexport default {\r\n    props: ['title', 'widgets', 'data', 'meta', 'layoutOrder', 'id', 'columns'],\r\n    components: {\r\n        'single-value': SingleValue,\r\n        'data-table': DataTable,\r\n        'line-graph': LineGraph\r\n    },\r\n    data: function() {\r\n        return {\r\n            highlightedDate: null,\r\n            draggingWidget: true,\r\n            // CSS Grid positioning\r\n            gridPositioning: {\r\n                'order': this.layoutOrder,\r\n                // number of columns wide\r\n                'grid-column': `span ${this.columns}`\r\n            }\r\n        }\r\n    },\r\n    methods: {\r\n        // add a new widget to the card\r\n        addWidget: function() {\r\n            let o = WidgetBase.newObject('prompt user for widget type');\r\n            console.log(o);\r\n        },\r\n        /**\r\n         * Update a widget in this card\r\n         * @param  {Object} newWidget object to replace with\r\n         * @param  {String} id        for widget being modified\r\n         * @return\r\n         */\r\n        modifyWidget: function(newWidget, id) {\r\n            this.$emit('modify-widget', newWidget, id, this.id);\r\n        },\r\n        // Return widgets of a given type (data-table, line-graph, etc.)\r\n        widgetsOfType: function(type) {\r\n            return this.widgets.filter((widget) => widget['component'] == type);\r\n        },\r\n\r\n        // React to user hovering over a day\r\n        hoverDate: function(date) {\r\n            this.highlightedDate = date;\r\n        },\r\n        unhoverDate: function(date) {\r\n            this.highlightedDate = null;\r\n        },\r\n\r\n        // Card drag and drop handling\r\n        dragstartHandler: function(event) {\r\n            if (!this.$store.state.editMode) return;\r\n            event.dataTransfer.setData('text/plain', this.id);\r\n        },\r\n\r\n        // Widget drag and drop handling\r\n        dragstartWidgetHandler: function(event, widget) {\r\n            if (!this.$store.state.editMode) return;\r\n            this.draggingWidget = true;\r\n            const dragData = {\r\n                cardId: this.id,\r\n                widgetId: widget.id\r\n            };\r\n            event.dataTransfer.setData('text/plain', JSON.stringify(dragData));\r\n        },\r\n        dragWidgetHandler: function(event) {\r\n            if (!this.$store.state.editMode) return;\r\n            event.preventDefault();\r\n        },\r\n\r\n        /**\r\n         * Handles dropping a widget on this card, sorting all the widgets.\r\n         * @param  {Event} event for window drop action\r\n         * @emits  update-widget event to Dashboard component\r\n         */\r\n        dropWidgetHandler: function(event) {\r\n            if (!this.$store.state.editMode) return;\r\n            let dragData;\r\n            try {\r\n                // Try to parse dragData as JSON and prevent other drag/drop\r\n                // effects\r\n                dragData = JSON.parse(\r\n                    event.dataTransfer.getData('text/plain'));\r\n                event.preventDefault();\r\n                event.stopPropagation();\r\n            // If dragData isn't JSON, move along\r\n            } catch (err) {\r\n                if (err instanceof SyntaxError) {\r\n                    return;\r\n                }\r\n            }\r\n\r\n            // If this widget is being dropped in a different card, ignore\r\n            if (dragData.cardId != this.id) return;\r\n\r\n            // Otherwise sort widgets and update the dashboard\r\n            let newWidgets = [];\r\n            Object.assign(newWidgets, this.widgets);\r\n\r\n            let el = (widget) => this.$refs[widget.id][0].$el;\r\n            newWidgets.sort((a, b) =>\r\n                sortOrder(a, b, event, dragData.widgetId, el)\r\n            );\r\n            // assign a layout order based on sort\r\n            newWidgets.forEach((widget, i) => {\r\n                widget.layoutOrder = i;\r\n            });\r\n\r\n            this.$emit('update-widgets', newWidgets, this.id);\r\n        }\r\n    }\r\n}\r\n</script>\r\n\r\n\r\n<style>\r\n.card {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    grid-gap: 3em;\r\n}\r\n\r\n/* Since the card's grid determines margins, remove margins from the first\r\n * child of each widget.\r\n*/\r\n.card > .widget > *:first-child {\r\n    margin-top: 0em;\r\n}\r\n.card {\r\n    transition: all 1s;\r\n    padding: 0.5em;\r\n}\r\n\r\n/* Buttons to edit card and/or add widgets */\r\n.card .edit-button,\r\n.card .add-button {\r\n    display: inline;\r\n    text-decoration: none;\r\n    position: absolute;\r\n    font-size: 1.25em;\r\n    color: #fff;\r\n    margin: 4%;\r\n    width: 2em;\r\n    height: 2em;\r\n    align-content: center;\r\n    justify-content: center;\r\n    background-color: rgba(100,100,100,0.5);\r\n    border-radius: 2em;\r\n}\r\n.card .edit-button:hover,\r\n.card .add-button:hover {\r\n    background-color: rgba(100,100,100,0.3);\r\n}\r\n.card .edit-button {\r\n    top: 0;\r\n    left: 0;\r\n}\r\n.card .add-button {\r\n    top: 0;\r\n    right: 0;\r\n}\r\n\r\n</style>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_table_vue__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__line_graph_vue__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__single_value_vue__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__javascript_scorecard_format__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__drag_n_drop_sort_js__ = __webpack_require__(22);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['title', 'widgets', 'data', 'meta', 'layoutOrder', 'id', 'columns'],
  components: {
    'single-value': __WEBPACK_IMPORTED_MODULE_3__single_value_vue__["a" /* default */],
    'data-table': __WEBPACK_IMPORTED_MODULE_1__data_table_vue__["a" /* default */],
    'line-graph': __WEBPACK_IMPORTED_MODULE_2__line_graph_vue__["a" /* default */]
  },
  data: function () {
    return {
      highlightedDate: null,
      draggingWidget: true,
      // CSS Grid positioning
      gridPositioning: {
        'order': this.layoutOrder,
        // number of columns wide
        'grid-column': `span ${this.columns}`
      }
    };
  },
  methods: {
    // add a new widget to the card
    addWidget: function () {
      let o = __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__["a" /* default */].newObject('prompt user for widget type');
      console.log(o);
    },

    /**
     * Update a widget in this card
     * @param  {Object} newWidget object to replace with
     * @param  {String} id        for widget being modified
     * @return
     */
    modifyWidget: function (newWidget, id) {
      this.$emit('modify-widget', newWidget, id, this.id);
    },
    // Return widgets of a given type (data-table, line-graph, etc.)
    widgetsOfType: function (type) {
      return this.widgets.filter(widget => widget['component'] == type);
    },
    // React to user hovering over a day
    hoverDate: function (date) {
      this.highlightedDate = date;
    },
    unhoverDate: function (date) {
      this.highlightedDate = null;
    },
    // Card drag and drop handling
    dragstartHandler: function (event) {
      if (!this.$store.state.editMode) return;
      event.dataTransfer.setData('text/plain', this.id);
    },
    // Widget drag and drop handling
    dragstartWidgetHandler: function (event, widget) {
      if (!this.$store.state.editMode) return;
      this.draggingWidget = true;
      const dragData = {
        cardId: this.id,
        widgetId: widget.id
      };
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    },
    dragWidgetHandler: function (event) {
      if (!this.$store.state.editMode) return;
      event.preventDefault();
    },

    /**
     * Handles dropping a widget on this card, sorting all the widgets.
     * @param  {Event} event for window drop action
     * @emits  update-widget event to Dashboard component
     */
    dropWidgetHandler: function (event) {
      if (!this.$store.state.editMode) return;
      let dragData;

      try {
        // Try to parse dragData as JSON and prevent other drag/drop
        // effects
        dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
        event.preventDefault();
        event.stopPropagation(); // If dragData isn't JSON, move along
      } catch (err) {
        if (err instanceof SyntaxError) {
          return;
        }
      } // If this widget is being dropped in a different card, ignore


      if (dragData.cardId != this.id) return; // Otherwise sort widgets and update the dashboard

      let newWidgets = [];
      Object.assign(newWidgets, this.widgets);

      let el = widget => this.$refs[widget.id][0].$el;

      newWidgets.sort((a, b) => Object(__WEBPACK_IMPORTED_MODULE_5__drag_n_drop_sort_js__["a" /* sortOrder */])(a, b, event, dragData.widgetId, el)); // assign a layout order based on sort

      newWidgets.forEach((widget, i) => {
        widget.layoutOrder = i;
      });
      this.$emit('update-widgets', newWidgets, this.id);
    }
  }
});

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__editor_vue__ = __webpack_require__(34);
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['id'],
  components: {
    'editor': __WEBPACK_IMPORTED_MODULE_0__editor_vue__["a" /* default */]
  },
  methods: {
    dragstartHandler: function (event) {
      this.$emit('dragstart-widget', event, this.$props);
    }
  },
  // Utility to return a blank widget
  newObject: function (type) {
    return {
      id: 'widget:' + uuidv4(),
      component: type,
      title: 'Hello World',
      field: '',
      filter: {}
    };
  }
});
/**
 * Returns unique ID number
 * @return {String} 16-bit UUID
 */

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_editor_vue__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a38dd874_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_editor_vue__ = __webpack_require__(40);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(35)
}
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_editor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a38dd874_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_editor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\editor.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a38dd874", Component.options)
  } else {
    hotAPI.reload("data-v-a38dd874", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(36);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("f189e898", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a38dd874\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./editor.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a38dd874\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "\n.editor-wrapper {\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    width: 100%;\n}\n.edit-form {\r\n    top: -100px;\n}\r\n\r\n/* Buttons to edit card and/or add widgets */\n.editor-wrapper .edit-button,\r\n.editor-wrapper .add-button {\r\n    display: inline;\r\n    text-decoration: none;\r\n    position: absolute;\r\n    font-size: 1.25em;\r\n    color: #fff;\r\n    margin: 4%;\r\n    width: 2em;\r\n    height: 2em;\r\n    align-content: center;\r\n    justify-content: center;\r\n    background-color: rgba(100,100,100,0.5);\r\n    border-radius: 2em;\n}\n.editor-wrapper .edit-button:hover,\r\n.editor-wrapper .add-button:hover {\r\n    background-color: rgba(100,100,100,0.3);\n}\n.editor-wrapper .edit-button {\r\n    top: 0;\r\n    left: 0;\n}\n.editor-wrapper .add-button {\r\n    top: 0;\r\n    right: 0;\n}\r\n", "", {"version":3,"sources":["C:/Users/nclonts/Documents/Rise/dashboard/five9-call-dashboard/src/public/components/src/public/components/editor.vue?5397453a"],"names":[],"mappings":";AA+FA;IACA,mBAAA;IACA,OAAA;IACA,QAAA;IACA,YAAA;CACA;AAEA;IACA,YAAA;CACA;;AAEA,6CAAA;AACA;;IAEA,gBAAA;IACA,sBAAA;IACA,mBAAA;IACA,kBAAA;IACA,YAAA;IACA,WAAA;IACA,WAAA;IACA,YAAA;IACA,sBAAA;IACA,wBAAA;IACA,wCAAA;IACA,mBAAA;CACA;AACA;;IAEA,wCAAA;CACA;AACA;IACA,OAAA;IACA,QAAA;CACA;AACA;IACA,OAAA;IACA,SAAA;CACA","file":"editor.vue","sourcesContent":["/**\r\n * Editor for widgets.\r\n */\r\n<template>\r\n    <div class=\"editor-wrapper\">\r\n        <!-- Buttons to begin editing -->\r\n        <button\r\n            class=\"edit-button\"\r\n            @click=\"edit\"\r\n        >&#9776;</button>\r\n\r\n        <!-- Modal form to modify the object -->\r\n        <div class=\"edit-form modal\"\r\n            v-if=\"editingNow\">\r\n\r\n            <h1>{{ newObject.title }}</h1>\r\n            <h3>Title</h3>\r\n            <input v-model=\"newObject.title\" />\r\n\r\n            <h3>Field</h3>\r\n            <input v-model=\"newObject.fieldName\" />\r\n\r\n            <h3>Date</h3>\r\n            <select name=\"date-dropdown\"\r\n                v-model=\"newObject.filter.date\">\r\n                <option\r\n                    v-for=\"option in dateOptions\"\r\n                    :value=\"option\"\r\n                >{{ option }}</option>\r\n            </select>\r\n\r\n            <div class=\"button-wrapper\">\r\n                <button\r\n                    @click=\"exit(true)\"\r\n                >Save</button>\r\n\r\n                <button\r\n                    @click=\"exit(false)\"\r\n                >Cancel</button>\r\n\r\n                <button\r\n                    class=\"delete\"\r\n                    @click=\"deleteObject\"\r\n                >Delete</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</template>\r\n\r\n\r\n<script>\r\nimport * as filters from '../javascript/filters'; // TODO: dropdown for date types\r\n\r\nconst clone = require('ramda/src/clone');\r\n\r\nexport default {\r\n    props: ['initialObject'],\r\n    data: function() {\r\n        return {\r\n            editingNow: false,\r\n            newObject: {},\r\n            dateOptions: filters.dateOptions()\r\n        }\r\n    },\r\n    // Create a copy of the passed-in object on creation\r\n    mounted() {\r\n        this.newObject = clone(this.initialObject);\r\n    },\r\n    methods: {\r\n        edit: function() {\r\n            this.editingNow = true;\r\n            // close modal on click outside window\r\n            document.documentElement.addEventListener('click', function(ev) {\r\n                if (!this.$el.contains(ev.target)) this.exit();\r\n            }.bind(this), false);\r\n        },\r\n        add: function() {\r\n        },\r\n        exit: function(saveChanges) {\r\n            console.log(this.newObject);\r\n            this.editingNow = false;\r\n            if (saveChanges) {\r\n                this.$emit('modify-widget', this.newObject);\r\n            }\r\n        },\r\n        deleteObject: function() {\r\n            this.editingNow = false;\r\n            this.$emit('modify-widget', {});\r\n        }\r\n    }\r\n}\r\n</script>\r\n\r\n\r\n<style>\r\n.editor-wrapper {\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    width: 100%;\r\n}\r\n\r\n.edit-form {\r\n    top: -100px;\r\n}\r\n\r\n/* Buttons to edit card and/or add widgets */\r\n.editor-wrapper .edit-button,\r\n.editor-wrapper .add-button {\r\n    display: inline;\r\n    text-decoration: none;\r\n    position: absolute;\r\n    font-size: 1.25em;\r\n    color: #fff;\r\n    margin: 4%;\r\n    width: 2em;\r\n    height: 2em;\r\n    align-content: center;\r\n    justify-content: center;\r\n    background-color: rgba(100,100,100,0.5);\r\n    border-radius: 2em;\r\n}\r\n.editor-wrapper .edit-button:hover,\r\n.editor-wrapper .add-button:hover {\r\n    background-color: rgba(100,100,100,0.3);\r\n}\r\n.editor-wrapper .edit-button {\r\n    top: 0;\r\n    left: 0;\r\n}\r\n.editor-wrapper .add-button {\r\n    top: 0;\r\n    right: 0;\r\n}\r\n</style>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__javascript_filters__ = __webpack_require__(17);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
 // TODO: dropdown for date types

const clone = __webpack_require__(18);

/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['initialObject'],
  data: function () {
    return {
      editingNow: false,
      newObject: {},
      dateOptions: __WEBPACK_IMPORTED_MODULE_0__javascript_filters__["b" /* dateOptions */]()
    };
  },

  // Create a copy of the passed-in object on creation
  mounted() {
    this.newObject = clone(this.initialObject);
  },

  methods: {
    edit: function () {
      this.editingNow = true; // close modal on click outside window

      document.documentElement.addEventListener('click', function (ev) {
        if (!this.$el.contains(ev.target)) this.exit();
      }.bind(this), false);
    },
    add: function () {},
    exit: function (saveChanges) {
      console.log(this.newObject);
      this.editingNow = false;

      if (saveChanges) {
        this.$emit('modify-widget', this.newObject);
      }
    },
    deleteObject: function () {
      this.editingNow = false;
      this.$emit('modify-widget', {});
    }
  }
});

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var _cloneRegExp = /*#__PURE__*/__webpack_require__(39);

var type = /*#__PURE__*/__webpack_require__(19);

/**
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */


function _clone(value, refFrom, refTo, deep) {
  var copy = function copy(copiedValue) {
    var len = refFrom.length;
    var idx = 0;
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }
      idx += 1;
    }
    refFrom[idx + 1] = value;
    refTo[idx + 1] = copiedValue;
    for (var key in value) {
      copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
    }
    return copiedValue;
  };
  switch (type(value)) {
    case 'Object':
      return copy({});
    case 'Array':
      return copy([]);
    case 'Date':
      return new Date(value.valueOf());
    case 'RegExp':
      return _cloneRegExp(value);
    default:
      return value;
  }
}
module.exports = _clone;

/***/ }),
/* 39 */
/***/ (function(module, exports) {

function _cloneRegExp(pattern) {
                                  return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}
module.exports = _cloneRegExp;

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "editor-wrapper" }, [
    _c("button", { staticClass: "edit-button", on: { click: _vm.edit } }, [
      _vm._v("☰")
    ]),
    _vm._v(" "),
    _vm.editingNow
      ? _c("div", { staticClass: "edit-form modal" }, [
          _c("h1", [_vm._v(_vm._s(_vm.newObject.title))]),
          _vm._v(" "),
          _c("h3", [_vm._v("Title")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.newObject.title,
                expression: "newObject.title"
              }
            ],
            domProps: { value: _vm.newObject.title },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.$set(_vm.newObject, "title", $event.target.value)
              }
            }
          }),
          _vm._v(" "),
          _c("h3", [_vm._v("Field")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.newObject.fieldName,
                expression: "newObject.fieldName"
              }
            ],
            domProps: { value: _vm.newObject.fieldName },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.$set(_vm.newObject, "fieldName", $event.target.value)
              }
            }
          }),
          _vm._v(" "),
          _c("h3", [_vm._v("Date")]),
          _vm._v(" "),
          _c(
            "select",
            {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.newObject.filter.date,
                  expression: "newObject.filter.date"
                }
              ],
              attrs: { name: "date-dropdown" },
              on: {
                change: function($event) {
                  var $$selectedVal = Array.prototype.filter
                    .call($event.target.options, function(o) {
                      return o.selected
                    })
                    .map(function(o) {
                      var val = "_value" in o ? o._value : o.value
                      return val
                    })
                  _vm.$set(
                    _vm.newObject.filter,
                    "date",
                    $event.target.multiple ? $$selectedVal : $$selectedVal[0]
                  )
                }
              }
            },
            _vm._l(_vm.dateOptions, function(option) {
              return _c("option", { domProps: { value: option } }, [
                _vm._v(_vm._s(option))
              ])
            })
          ),
          _vm._v(" "),
          _c("div", { staticClass: "button-wrapper" }, [
            _c(
              "button",
              {
                on: {
                  click: function($event) {
                    _vm.exit(true)
                  }
                }
              },
              [_vm._v("Save")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                on: {
                  click: function($event) {
                    _vm.exit(false)
                  }
                }
              },
              [_vm._v("Cancel")]
            ),
            _vm._v(" "),
            _c(
              "button",
              { staticClass: "delete", on: { click: _vm.deleteObject } },
              [_vm._v("Delete")]
            )
          ])
        ])
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-a38dd874", esExports)
  }
}

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(42);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("5e100a93", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-48d3d2c4\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./data-table.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-48d3d2c4\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./data-table.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"data-table.vue","sourceRoot":""}]);

// exports


/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_table_row_vue__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__ = __webpack_require__(9);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["a"] = ({
  extends: __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__["a" /* default */],
  props: ['data', 'highlightedDate'],
  components: {
    'data-table-row': __WEBPACK_IMPORTED_MODULE_0__data_table_row_vue__["a" /* default */]
  },
  computed: {
    headers: function () {
      return Object.keys(this.data[0]);
    }
  },
  methods: {
    hoverDate: function (date) {
      this.$emit('hoverDate', date);
    },
    unhoverDate: function (date) {
      this.$emit('unhoverDate', date);
    }
  }
});

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_data_table_row_vue__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_067c065e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_data_table_row_vue__ = __webpack_require__(46);
var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_data_table_row_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_067c065e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_data_table_row_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\data-table-row.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-067c065e", Component.options)
  } else {
    hotAPI.reload("data-v-067c065e", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__javascript_scorecard_format_js__ = __webpack_require__(10);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['datum', 'headers', 'isHighlighted'],
  methods: {
    highlightDate: function (datum) {
      this.$emit('hoverDate', datum.Date);
    },
    unhighlightDate: function (datum) {
      this.$emit('unhoverDate', datum.Date);
    },
    formatted: function (val, fieldName) {
      let res = Object(__WEBPACK_IMPORTED_MODULE_0__javascript_scorecard_format_js__["a" /* formatValue */])(val, this.$store.getters.field(fieldName));
      return res;
    }
  }
});

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "tr",
    { class: { highlight: _vm.isHighlighted } },
    _vm._l(_vm.datum, function(val, key) {
      return _c(
        "td",
        {
          class: _vm.formatted(val, key).styleClass,
          on: {
            mouseover: function($event) {
              _vm.highlightDate(_vm.datum)
            },
            mouseleave: _vm.unhighlightDate
          }
        },
        [
          _vm._v(
            "\n        " + _vm._s(_vm.formatted(val, key).value) + "\n    "
          )
        ]
      )
    })
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-067c065e", esExports)
  }
}

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "data-table-wrapper",
      attrs: { draggable: _vm.$store.state.editMode },
      on: { dragstart: _vm.dragstartHandler }
    },
    [
      _c("table", { staticClass: "data-table" }, [
        _c("thead", [
          _c(
            "tr",
            _vm._l(_vm.headers, function(header) {
              return _c("th", [_vm._v(_vm._s(header))])
            })
          )
        ]),
        _vm._v(" "),
        _c(
          "tbody",
          _vm._l(_vm.data, function(datum, i) {
            return _c("data-table-row", {
              key: i,
              tag: "tr",
              attrs: {
                datum: datum,
                isHighlighted: _vm.highlightedDate == datum.Date
              },
              on: { hoverDate: _vm.hoverDate, unhoverDate: _vm.unhoverDate }
            })
          })
        )
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-48d3d2c4", esExports)
  }
}

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_line_graph_vue__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_21d5040e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_line_graph_vue__ = __webpack_require__(52);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(49)
}
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-21d5040e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_line_graph_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_21d5040e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_line_graph_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\line-graph.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-21d5040e", Component.options)
  } else {
    hotAPI.reload("data-v-21d5040e", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(50);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("7034c06e", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-21d5040e\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./line-graph.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-21d5040e\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./line-graph.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "\n.line-graph[data-v-21d5040e] {\n    max-width: 100%;\n}\n.graph-wrap[data-v-21d5040e]:hover {\n    cursor: pointer;\n}\n.graph-wrap[data-v-21d5040e] {\n    height: 150px;\n    width: 100%;\n}\n.graph-wrap text[data-v-21d5040e] {\n    text-anchor: middle;\n    font-size: 0.8em;\n    fill: #ddd;\n}\nh1[data-v-21d5040e], .content[data-v-21d5040e] {\n  margin-left: 20px;\n}\nlabel[data-v-21d5040e] {\n  display: inline-block;\n  width: 150px;\n}\n.line[data-v-21d5040e] {\n    fill: none;\n    stroke: steelblue;\n    stroke-linejoin: round;\n    stroke-linecap: round;\n    stroke-width: 1.5;\n}\n.goal-line[data-v-21d5040e] {\n    fill: none;\n    stroke: lightgrey;\n    stroke-opacity: 0.7;\n    stroke-width: 1.0;\n}\n.axis[data-v-21d5040e] {\n    font-size: 0.5em;\n}\n.selector[data-v-21d5040e] {\n    stroke: hsla(207, 84%, 85%, 0.7);\n    stroke-width: 1.0;\n    fill: none;\n}\n", "", {"version":3,"sources":["C:/Users/nclonts/Documents/Rise/dashboard/five9-call-dashboard/src/public/components/src/public/components/line-graph.vue?000fb3d2"],"names":[],"mappings":";AAwNA;IACA,gBAAA;CACA;AACA;IACA,gBAAA;CACA;AACA;IACA,cAAA;IACA,YAAA;CACA;AACA;IACA,oBAAA;IACA,iBAAA;IACA,WAAA;CACA;AAGA;EACA,kBAAA;CACA;AACA;EACA,sBAAA;EACA,aAAA;CACA;AAEA;IACA,WAAA;IACA,kBAAA;IACA,uBAAA;IACA,sBAAA;IACA,kBAAA;CACA;AACA;IACA,WAAA;IACA,kBAAA;IACA,oBAAA;IACA,kBAAA;CACA;AACA;IACA,iBAAA;CACA;AACA;IACA,iCAAA;IACA,kBAAA;IACA,WAAA;CACA","file":"line-graph.vue","sourcesContent":["/**\r\nLine graph widget. Uses D3 to render an SVG based on data and fields props.\r\n\r\nAccepts data prop with structure:\r\n{\r\n  'yyyy-mm-dd': 1,\r\n  'yyyy-mm-dd': 2, ...\r\n}\r\n */\r\n\r\n<template>\r\n<div class=\"line-graph\"\r\n    :draggable=\"$store.state.editMode\"\r\n    @dragstart=\"dragstartHandler\">\r\n    <div ref=\"graph-wrap\" class=\"graph-wrap\">\r\n        <svg @click=\"toggleTable\" @mousemove=\"mouseover\" @mouseleave=\"mouseleave\"\r\n                :width=\"width\" :height=\"height\">\r\n            <text class=\"title\" :x=\"55\" :y=\"10\">{{ fields.y }}</text>\r\n            <g class=\"axis\" ref=\"yaxis\" :style=\"{transform: `translate(20px,${margin.top}px)`}\"></g>\r\n            <g :style=\"{transform: `translate(${margin.left}px, ${margin.top}px)`}\">\r\n                <path class=\"area\" :d=\"paths.area\" />\r\n                <path class=\"goal-line\" :d=\"paths.goalLine\" />\r\n                <path class=\"line\" :d=\"paths.line\" />\r\n                <path class=\"selector\" :d=\"paths.selector\" />\r\n            </g>\r\n        </svg>\r\n    </div>\r\n\r\n    <data-table\r\n        v-if=\"showTable\"\r\n        @hoverDate=\"hoverDate\"\r\n        @unhoverDate=\"unhoverDate\"\r\n        :data=\"data\"\r\n        :highlightedDate=\"highlightedDate\"\r\n    ></data-table>\r\n</div>\r\n</template>\r\n\r\n<script>\r\n\r\nimport DataTable from './data-table.vue';\r\nimport WidgetBase from './widget-base.vue';\r\n\r\nconst props = {\r\n    fields: {\r\n        type: Object\r\n    },\r\n    data: {\r\n        type: Array,\r\n        default: () => []\r\n    },\r\n    margin: {\r\n        type: Object,\r\n        default: () => ({\r\n            left: 40,\r\n            right: 10,\r\n            top: 15,\r\n            bottom: 10,\r\n        }),\r\n    }\r\n};\r\n\r\nexport default {\r\n    extends: WidgetBase,\r\n    name: 'line-graph',\r\n\r\n    props,\r\n\r\n    components: {\r\n        'data-table': DataTable\r\n    },\r\n\r\n    data () {\r\n        return {\r\n            showTable: false,\r\n            highlightedDate: null,\r\n            width: 0,\r\n            height: 0,\r\n            paths: {\r\n                area: '',\r\n                line: '',\r\n                selector: '',\r\n                goalLine: ''\r\n            },\r\n            lastHoverPoint: {},\r\n            scaled: {\r\n                x: null,\r\n                y: null,\r\n            },\r\n            points: [],\r\n        };\r\n    },\r\n\r\n    computed: {\r\n        padded() {\r\n            const width = this.width - this.margin.left - this.margin.right;\r\n            const height = this.height - this.margin.top - this.margin.bottom;\r\n            return { width, height };\r\n        },\r\n        ceil() {\r\n            return d3.max(this.data, (d) => d[this.fields.y]);\r\n        }\r\n    },\r\n\r\n    mounted() {\r\n        window.addEventListener('resize', this.onResize);\r\n        this.onResize();\r\n    },\r\n\r\n    beforeDestroy() {\r\n        window.removeEventListener('resize', this.onResize);\r\n    },\r\n\r\n    watch: {\r\n        width: function(newWidth) { this.update(); },\r\n        data: function(newData) { this.update(); }\r\n    },\r\n\r\n    methods: {\r\n        toggleTable() {\r\n            this.showTable = !this.showTable;\r\n        },\r\n\r\n        hoverDate(date) {\r\n            this.highlightedDate = date;\r\n        },\r\n        unhoverDate(date) {\r\n            this.highlightedDate = null;\r\n        },\r\n\r\n        onResize() {\r\n            // Set width equal to card -- grandparent element\r\n            this.width = this.$refs['graph-wrap'].parentElement.parentElement.offsetWidth;\r\n            this.height = this.$refs['graph-wrap'].offsetHeight;\r\n        },\r\n        createArea: d3.area().x(d => d.x).y0(d => d.max).y1(d => d.y),\r\n        createLine: d3.line().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX),\r\n        createValueSelector(point) {\r\n            return d3.area().x(d => d.x).y0(this.padded.height).y1(0)(point);\r\n        },\r\n        initialize() {\r\n            this.scaled.x = d3.scaleTime().rangeRound([0, this.padded.width]);\r\n            this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);\r\n            d3.axisLeft().scale(this.scaled.x);\r\n            d3.axisBottom().scale(this.scaled.y);\r\n        },\r\n        update() {\r\n            this.initialize();\r\n            const parseTime = d3.timeParse('%Y-%m-%d');\r\n            for (let d of this.data) {\r\n                d[this.fields.y] *= 1;\r\n                if (isNaN(d[this.fields.y])) d[this.fields.y] = 0;\r\n            }\r\n\r\n            this.scaled.x.domain(d3.extent(this.data, (d) => parseTime(d[this.fields.x])));\r\n            this.scaled.y.domain([0, this.ceil]);\r\n            this.points = [];\r\n\r\n            // Draw goal line\r\n            let goal = this.$store.getters.field(this.fields.y).goal;\r\n            let goalPoints = this.scaled.x.domain().map((xVal) =>\r\n                ({\r\n                    x: this.scaled.x(xVal),\r\n                    y: this.scaled.y(goal)\r\n                })\r\n            );\r\n            this.paths.goalLine = this.createLine(goalPoints);\r\n\r\n            // Create graph points\r\n            for (let d of this.data) {\r\n                this.points.push({\r\n                    x: this.scaled.x(parseTime(d[this.fields.x])),\r\n                    y: this.scaled.y(d[this.fields.y]),\r\n                    max: this.height,\r\n                });\r\n            }\r\n            // this.paths.area = this.createArea(this.points);\r\n            this.paths.line = this.createLine(this.points);\r\n\r\n            // draw axes\r\n            d3.select(this.$refs.yaxis)\r\n                .call(d3.axisLeft(this.scaled.y))\r\n                .selectAll('path, .tick line')\r\n                .attr('stroke', '#ccc');\r\n            d3.select(this.$refs.yaxis).selectAll('text').attr('fill', '#ddd');\r\n        },\r\n        mouseover({ offsetX }) {\r\n            if (this.points.length > 0) {\r\n                const x = offsetX - this.margin.left;\r\n                const closestPoint = this.getClosestPoint(x);\r\n                if (this.lastHoverPoint.index !== closestPoint.index) {\r\n                    const point = this.points[closestPoint.index];\r\n                    this.paths.selector = this.createValueSelector([point]);\r\n                    this.$emit('select', this.data[closestPoint.index]);\r\n                    this.lastHoverPoint = closestPoint;\r\n                }\r\n            }\r\n        },\r\n        mouseleave() {\r\n            this.paths.selector = '';\r\n        },\r\n        getClosestPoint(x) {\r\n            return this.points\r\n                .map((point, index) => ({\r\n                    x: point.x,\r\n                    diff: Math.abs(point.x - x),\r\n                    index,\r\n                }))\r\n                .reduce((least, val) => (least.diff < val.diff ? least : val));\r\n        }\r\n    }\r\n};\r\n</script>\r\n\r\n\r\n<style scoped>\r\n    .line-graph {\r\n        max-width: 100%;\r\n    }\r\n    .graph-wrap:hover {\r\n        cursor: pointer;\r\n    }\r\n    .graph-wrap {\r\n        height: 150px;\r\n        width: 100%;\r\n    }\r\n    .graph-wrap text {\r\n        text-anchor: middle;\r\n        font-size: 0.8em;\r\n        fill: #ddd;\r\n    }\r\n\r\n\r\n    h1, .content {\r\n      margin-left: 20px;\r\n    }\r\n    label {\r\n      display: inline-block;\r\n      width: 150px;\r\n    }\r\n\r\n    .line {\r\n        fill: none;\r\n        stroke: steelblue;\r\n        stroke-linejoin: round;\r\n        stroke-linecap: round;\r\n        stroke-width: 1.5;\r\n    }\r\n    .goal-line {\r\n        fill: none;\r\n        stroke: lightgrey;\r\n        stroke-opacity: 0.7;\r\n        stroke-width: 1.0;\r\n    }\r\n    .axis {\r\n        font-size: 0.5em;\r\n    }\r\n    .selector {\r\n        stroke: hsla(207, 84%, 85%, 0.7);\r\n        stroke-width: 1.0;\r\n        fill: none;\r\n    }\r\n</style>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_table_vue__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__ = __webpack_require__(9);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


const props = {
  fields: {
    type: Object
  },
  data: {
    type: Array,
    default: () => []
  },
  margin: {
    type: Object,
    default: () => ({
      left: 40,
      right: 10,
      top: 15,
      bottom: 10
    })
  }
};
/* harmony default export */ __webpack_exports__["a"] = ({
  extends: __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__["a" /* default */],
  name: 'line-graph',
  props,
  components: {
    'data-table': __WEBPACK_IMPORTED_MODULE_0__data_table_vue__["a" /* default */]
  },

  data() {
    return {
      showTable: false,
      highlightedDate: null,
      width: 0,
      height: 0,
      paths: {
        area: '',
        line: '',
        selector: '',
        goalLine: ''
      },
      lastHoverPoint: {},
      scaled: {
        x: null,
        y: null
      },
      points: []
    };
  },

  computed: {
    padded() {
      const width = this.width - this.margin.left - this.margin.right;
      const height = this.height - this.margin.top - this.margin.bottom;
      return {
        width,
        height
      };
    },

    ceil() {
      return d3.max(this.data, d => d[this.fields.y]);
    }

  },

  mounted() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },

  watch: {
    width: function (newWidth) {
      this.update();
    },
    data: function (newData) {
      this.update();
    }
  },
  methods: {
    toggleTable() {
      this.showTable = !this.showTable;
    },

    hoverDate(date) {
      this.highlightedDate = date;
    },

    unhoverDate(date) {
      this.highlightedDate = null;
    },

    onResize() {
      // Set width equal to card -- grandparent element
      this.width = this.$refs['graph-wrap'].parentElement.parentElement.offsetWidth;
      this.height = this.$refs['graph-wrap'].offsetHeight;
    },

    createArea: d3.area().x(d => d.x).y0(d => d.max).y1(d => d.y),
    createLine: d3.line().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX),

    createValueSelector(point) {
      return d3.area().x(d => d.x).y0(this.padded.height).y1(0)(point);
    },

    initialize() {
      this.scaled.x = d3.scaleTime().rangeRound([0, this.padded.width]);
      this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);
      d3.axisLeft().scale(this.scaled.x);
      d3.axisBottom().scale(this.scaled.y);
    },

    update() {
      this.initialize();
      const parseTime = d3.timeParse('%Y-%m-%d');

      for (let d of this.data) {
        d[this.fields.y] *= 1;
        if (isNaN(d[this.fields.y])) d[this.fields.y] = 0;
      }

      this.scaled.x.domain(d3.extent(this.data, d => parseTime(d[this.fields.x])));
      this.scaled.y.domain([0, this.ceil]);
      this.points = []; // Draw goal line

      let goal = this.$store.getters.field(this.fields.y).goal;
      let goalPoints = this.scaled.x.domain().map(xVal => ({
        x: this.scaled.x(xVal),
        y: this.scaled.y(goal)
      }));
      this.paths.goalLine = this.createLine(goalPoints); // Create graph points

      for (let d of this.data) {
        this.points.push({
          x: this.scaled.x(parseTime(d[this.fields.x])),
          y: this.scaled.y(d[this.fields.y]),
          max: this.height
        });
      } // this.paths.area = this.createArea(this.points);


      this.paths.line = this.createLine(this.points); // draw axes

      d3.select(this.$refs.yaxis).call(d3.axisLeft(this.scaled.y)).selectAll('path, .tick line').attr('stroke', '#ccc');
      d3.select(this.$refs.yaxis).selectAll('text').attr('fill', '#ddd');
    },

    mouseover({
      offsetX
    }) {
      if (this.points.length > 0) {
        const x = offsetX - this.margin.left;
        const closestPoint = this.getClosestPoint(x);

        if (this.lastHoverPoint.index !== closestPoint.index) {
          const point = this.points[closestPoint.index];
          this.paths.selector = this.createValueSelector([point]);
          this.$emit('select', this.data[closestPoint.index]);
          this.lastHoverPoint = closestPoint;
        }
      }
    },

    mouseleave() {
      this.paths.selector = '';
    },

    getClosestPoint(x) {
      return this.points.map((point, index) => ({
        x: point.x,
        diff: Math.abs(point.x - x),
        index
      })).reduce((least, val) => least.diff < val.diff ? least : val);
    }

  }
});

/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "line-graph",
      attrs: { draggable: _vm.$store.state.editMode },
      on: { dragstart: _vm.dragstartHandler }
    },
    [
      _c("div", { ref: "graph-wrap", staticClass: "graph-wrap" }, [
        _c(
          "svg",
          {
            attrs: { width: _vm.width, height: _vm.height },
            on: {
              click: _vm.toggleTable,
              mousemove: _vm.mouseover,
              mouseleave: _vm.mouseleave
            }
          },
          [
            _c("text", { staticClass: "title", attrs: { x: 55, y: 10 } }, [
              _vm._v(_vm._s(_vm.fields.y))
            ]),
            _vm._v(" "),
            _c("g", {
              ref: "yaxis",
              staticClass: "axis",
              style: { transform: "translate(20px," + _vm.margin.top + "px)" }
            }),
            _vm._v(" "),
            _c(
              "g",
              {
                style: {
                  transform:
                    "translate(" +
                    _vm.margin.left +
                    "px, " +
                    _vm.margin.top +
                    "px)"
                }
              },
              [
                _c("path", {
                  staticClass: "area",
                  attrs: { d: _vm.paths.area }
                }),
                _vm._v(" "),
                _c("path", {
                  staticClass: "goal-line",
                  attrs: { d: _vm.paths.goalLine }
                }),
                _vm._v(" "),
                _c("path", {
                  staticClass: "line",
                  attrs: { d: _vm.paths.line }
                }),
                _vm._v(" "),
                _c("path", {
                  staticClass: "selector",
                  attrs: { d: _vm.paths.selector }
                })
              ]
            )
          ]
        )
      ]),
      _vm._v(" "),
      _vm.showTable
        ? _c("data-table", {
            attrs: { data: _vm.data, highlightedDate: _vm.highlightedDate },
            on: { hoverDate: _vm.hoverDate, unhoverDate: _vm.unhoverDate }
          })
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-21d5040e", esExports)
  }
}

/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_single_value_vue__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4ae719c5_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_single_value_vue__ = __webpack_require__(55);
var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_single_value_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4ae719c5_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_single_value_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\single-value.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4ae719c5", Component.options)
  } else {
    hotAPI.reload("data-v-4ae719c5", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__javascript_scorecard_format__ = __webpack_require__(10);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



function sum(obj, key) {
  return obj.reduce((sum, item) => sum + item[key], 0);
}

/* harmony default export */ __webpack_exports__["a"] = ({
  extends: __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__["a" /* default */],
  props: ['title', 'fieldName', 'filter'],
  computed: {
    field: function () {
      return this.$store.getters.field(this.fieldName);
    },
    formatted: function () {
      return Object(__WEBPACK_IMPORTED_MODULE_1__javascript_scorecard_format__["a" /* formatValue */])(this.value, this.field);
    },
    value: function () {
      let data = this.$store.getters.getData(this.filter, this.fieldName);

      if (this.fieldName == 'AHT') {
        return sum(data, 'handleTime') / sum(data, 'calls');
      } else if (this.fieldName == 'ACW') {
        return sum(data, 'acwTime') / sum(data, 'calls');
      } else if (this.fieldName == 'calls') {
        return sum(data, 'calls');
      } else {
        throw new Error(`SingleValue component isn't expecting the field name: ${this.fieldName}`);
      }
    }
  },
  methods: {
    modify: function (newWidget) {
      this.$emit('modify-widget', newWidget, this.id);
    }
  }
});

/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "single-value",
      attrs: { draggable: _vm.$store.state.editMode },
      on: { dragstart: _vm.dragstartHandler }
    },
    [
      _c("h3", [_vm._v(_vm._s(_vm.title))]),
      _vm._v(" "),
      _c("p", { staticClass: "metric", class: _vm.formatted.styleClass }, [
        _vm._v("\r\n        " + _vm._s(_vm.formatted.value) + "\r\n    ")
      ]),
      _vm._v(" "),
      _vm.$store.state.editMode
        ? _c("editor", {
            attrs: { initialObject: _vm.$props },
            on: { "modify-widget": _vm.modify }
          })
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4ae719c5", esExports)
  }
}

/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "card metric-wrapper stats-box",
      style: _vm.gridPositioning,
      attrs: { id: _vm.id },
      on: { dragover: _vm.dragWidgetHandler, drop: _vm.dropWidgetHandler }
    },
    [
      _c(
        "h2",
        {
          staticClass: "title descriptor",
          attrs: { draggable: _vm.$store.state.editMode },
          on: { dragstart: _vm.dragstartHandler }
        },
        [_vm._v(_vm._s(_vm.title))]
      ),
      _vm._v(" "),
      _vm.$store.state.editMode
        ? _c(
            "button",
            {
              staticClass: "edit-button",
              on: {
                click: function($event) {
                  _vm.$emit("edit-card", _vm.id)
                }
              }
            },
            [_vm._v("☰")]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.$store.state.editMode
        ? _c(
            "button",
            { staticClass: "add-button", on: { click: _vm.addWidget } },
            [_vm._v("+")]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm._l(_vm.widgetsOfType("single-value"), function(widget, i) {
        return _c(
          "single-value",
          _vm._b(
            {
              key: widget.id,
              ref: widget.id,
              refInFor: true,
              staticClass: "widget",
              style: { order: widget.layoutOrder },
              on: {
                "dragstart-widget": _vm.dragstartWidgetHandler,
                "modify-widget": _vm.modifyWidget
              }
            },
            "single-value",
            widget,
            false
          )
        )
      }),
      _vm._v(" "),
      _vm._l(_vm.widgetsOfType("line-graph"), function(widget, i) {
        return _c(
          "line-graph",
          _vm._b(
            {
              key: widget.id,
              ref: widget.id,
              refInFor: true,
              staticClass: "widget",
              style: { order: widget.layoutOrder },
              attrs: { data: _vm.data },
              on: { "dragstart-widget": _vm.dragstartWidgetHandler }
            },
            "line-graph",
            widget,
            false
          )
        )
      }),
      _vm._v(" "),
      _vm._l(_vm.widgetsOfType("data-table"), function(widget, i) {
        return _c(
          "data-table",
          _vm._b(
            {
              key: widget.id,
              ref: widget.id,
              refInFor: true,
              staticClass: "widget",
              style: { order: widget.layoutOrder },
              attrs: { data: _vm.data, highlightedDate: _vm.highlightedDate },
              on: {
                hoverDate: _vm.hoverDate,
                unhoverDate: _vm.unhoverDate,
                "dragstart-widget": _vm.dragstartWidgetHandler
              }
            },
            "data-table",
            widget,
            false
          )
        )
      })
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3bec8029", esExports)
  }
}

/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_card_editor_vue__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_9d3c827e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_card_editor_vue__ = __webpack_require__(61);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(58)
}
var normalizeComponent = __webpack_require__(1)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_card_editor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_9d3c827e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_card_editor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\card-editor.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-9d3c827e", Component.options)
  } else {
    hotAPI.reload("data-v-9d3c827e", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(59);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("419b5586", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9d3c827e\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./card-editor.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9d3c827e\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./card-editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"card-editor.vue","sourceRoot":""}]);

// exports


/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['id', 'title'],
  data: function () {
    return {
      newCard: {
        id: this.id,
        title: this.title
      }
    };
  }
});

/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "modal" }, [
    _c("h1", [_vm._v(_vm._s(_vm.newCard.title))]),
    _vm._v(" "),
    _c("h3", [_vm._v("Title")]),
    _vm._v(" "),
    _c("input", {
      directives: [
        {
          name: "model",
          rawName: "v-model",
          value: _vm.newCard.title,
          expression: "newCard.title"
        }
      ],
      domProps: { value: _vm.newCard.title },
      on: {
        input: function($event) {
          if ($event.target.composing) {
            return
          }
          _vm.$set(_vm.newCard, "title", $event.target.value)
        }
      }
    }),
    _vm._v(" "),
    _c("div", { staticClass: "button-wrapper" }, [
      _c(
        "button",
        {
          on: {
            click: function($event) {
              _vm.$emit("exit-edit", true, _vm.newCard.id, _vm.newCard)
            }
          }
        },
        [_vm._v("Save")]
      ),
      _vm._v(" "),
      _c(
        "button",
        {
          on: {
            click: function($event) {
              _vm.$emit("exit-edit", false)
            }
          }
        },
        [_vm._v("Cancel")]
      ),
      _vm._v(" "),
      _c(
        "button",
        {
          staticClass: "delete",
          on: {
            click: function($event) {
              _vm.$emit("delete-card", _vm.id)
            }
          }
        },
        [_vm._v("Delete")]
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-9d3c827e", esExports)
  }
}

/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "dashboard scorecard-wrapper",
      on: { dragover: _vm.dragoverHandler, drop: _vm.dropHandler }
    },
    [
      _vm._l(_vm.layout.cards, function(card, i) {
        return _c(
          "card",
          _vm._b(
            {
              key: i,
              ref: card.id,
              refInFor: true,
              on: {
                "edit-card": _vm.editCard,
                "modify-widget": _vm.modifyWidget,
                "update-widgets": _vm.updateWidgets
              }
            },
            "card",
            card,
            false
          )
        )
      }),
      _vm._v(" "),
      _vm.editingCard
        ? _c(
            "card-editor",
            _vm._b(
              {
                on: { "exit-edit": _vm.exitEdit, "delete-card": _vm.deleteCard }
              },
              "card-editor",
              _vm.editedCard,
              false
            )
          )
        : _vm._e()
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-c21f7d6a", esExports)
  }
}

/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export loadData */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__filters__ = __webpack_require__(17);
/**
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access.
 */



const sift = __webpack_require__(64);

const fields = [// Date
{
  displayName: 'Date',
  fieldName: 'Date',
  hasGoal: false,
  goal: 0,
  goalThresholds: [],
  comparator: '',
  descriptor: '',
  format: {
    type: 'Time',
    string: 'M/D/YYYY'
  }
}, // Sales close rate
{
  displayName: 'Close Rate',
  fieldName: 'Close Rate',
  hasGoal: true,
  goal: 0.55,
  goalThresholds: [0.45, 0.50, 0.55],
  comparator: '>=',
  descriptor: 'See these tips for greatest close rates!',
  format: {
    type: 'Number',
    string: '.2%'
  }
}, // DIRECTV sales count
{
  displayName: 'DIRECTV Sales',
  fieldName: 'DIRECTV Sales',
  hasGoal: true,
  goal: 1,
  goalThresholds: [],
  comparator: '>=',
  descriptor: 'See these tips for greatest DTV Sales!',
  format: {
    type: 'Number',
    string: 'd'
  }
}, // AHT - Average Handle Time
{
  displayName: 'AHT',
  fieldName: 'AHT',
  calculation: '{handleTime} / {calls}',
  hasGoal: true,
  goal: 600,
  goalThresholds: [],
  comparator: '<=',
  descriptor: 'See these tips for ways to lower handle time!',
  format: {
    type: 'Time',
    string: 'm:ss'
  }
}, // ACW - After Call Work
{
  displayName: 'ACW',
  fieldName: 'ACW',
  calculation: '{acwTime} / {calls}',
  hasGoal: true,
  goal: 30,
  goalThresholds: [],
  comparator: '<=',
  descriptor: 'See these tips for ways to lower ACW!',
  format: {
    type: 'Time',
    string: 'm:ss'
  }
}];
/**
 * Vuex is used to see if app is in edit mode (editMode Boolean), and store
 * field (meta) data.
 * @type {Vuex}
 */

const store = new Vuex.Store({
  state: {
    fields: fields,
    editMode: true,
    ahtData: [],
    currentUser: '',
    timeoutId: 0
  },
  getters: {
    field: state => fieldName => {
      return state.fields.find(f => f.fieldName == fieldName);
    },
    getData: state => (filter, field) => {
      const filt = __WEBPACK_IMPORTED_MODULE_1__filters__["a" /* clean */](filter, state.currentUser);
      let data = sift(filt, state.ahtData.map(d => Object.assign({}, d, d._id)));
      return data;
    }
  },
  mutations: {
    toggleEditMode(state) {
      state.editMode = !state.editMode;
    },

    updateData(state, newData) {
      state.ahtData = newData;
    },

    /**
     * Set the current user
     * @param  {Object} state
     * @param  {String} newUsername
     */
    updateUser(state, newUsername) {
      state.currentUser = newUsername;
    },

    setTimeoutId(state, id) {
      state.timeoutId = id;
    }

  },
  actions: {
    async startUpdating(context) {
      console.log(`Refresh at ${moment()}`); // Load data from server

      const data = await loadData();
      console.log(data);
      context.commit('updateData', data); // and schedule the next update

      const frequencySeconds = 60;
      let timeout = setTimeout(function next() {
        context.dispatch('startUpdating');
      }, frequencySeconds * 1000);
      context.commit({
        type: 'setTimeoutId',
        value: timeout
      });
    }

  }
});
/* harmony export (immutable) */ __webpack_exports__["a"] = store;

async function loadData() {
  const params = {
    filter: {
      // agentGroup: {
      //     $in: ['Customer Care', 'Sales'],
      // },
      agentUsername: {
        $eq: store.state.currentUser.trim()
      },
      date: {
        start: '2018-01-01T00:00:00',
        end: '2018-02-01T00:00:00'
      }
    },
    fields: {
      sum: ['calls', 'handleTime', 'acwTime']
    },
    groupBy: ['agentUsername', 'skill', 'dateDay']
  };
  const data = await __WEBPACK_IMPORTED_MODULE_0__api__["e" /* getStatistics */](params);
  const cleaned = data.map(d => {
    d['dateDay'] = moment(d['dateDay']).toDate();
    d._id.dateDay = moment(d._id.dateDay).toDate();
    return d;
  });
  return cleaned;
}

/***/ }),
/* 64 */
/***/ (function(module, exports) {

/*
 * Sift 3.x
 *
 * Copryright 2015, Craig Condon
 * Licensed under MIT
 *
 * Filter JavaScript objects with mongodb queries
 */

(function() {

  'use strict';

  /**
   */

  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   */

  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  /**
   */

  function comparable(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (isArray(value)) {
      return value.map(comparable);
    } else if (value && typeof value.toJSON === 'function') {
      return value.toJSON();
    } else {
      return value;
    }
  }

  function get(obj, key) {
    return isFunction(obj.get) ? obj.get(key) : obj[key];
  }

  /**
   */

  function or(validator) {
    return function(a, b) {
      if (!isArray(b) || !b.length) {
        return validator(a, b);
      }
      for (var i = 0, n = b.length; i < n; i++) {
        if (validator(a, get(b,i))) return true;
      }
      return false;
    }
  }

  /**
   */

  function and(validator) {
    return function(a, b) {
      if (!isArray(b) || !b.length) {
        return validator(a, b);
      }
      for (var i = 0, n = b.length; i < n; i++) {
        if (!validator(a, get(b, i))) return false;
      }
      return true;
    };
  }

  function validate(validator, b, k, o) {
    return validator.v(validator.a, b, k, o);
  }

  var OPERATORS = {

    /**
     */

    $eq: or(function(a, b) {
      return a(b);
    }),

    /**
     */

    $ne: and(function(a, b) {
      return !a(b);
    }),

    /**
     */

    $gt: or(function(a, b) {
      return sift.compare(comparable(b), a) > 0;
    }),

    /**
     */

    $gte: or(function(a, b) {
      return sift.compare(comparable(b), a) >= 0;
    }),

    /**
     */

    $lt: or(function(a, b) {
      return sift.compare(comparable(b), a) < 0;
    }),

    /**
     */

    $lte: or(function(a, b) {
      return sift.compare(comparable(b), a) <= 0;
    }),

    /**
     */

    $mod: or(function(a, b) {
      return b % a[0] == a[1];
    }),

    /**
     */

    $in: function(a, b) {

      if (b instanceof Array) {
        for (var i = b.length; i--;) {
          if (~a.indexOf(comparable(get(b, i)))) {
            return true;
          }
        }
      } else {
        var comparableB = comparable(b);
        if (comparableB === b && typeof b === 'object') {
          for (var i = a.length; i--;) {
            if (String(a[i]) === String(b) && String(b) !== '[object Object]') {
              return true;
            }
          }
        }

        /*
          Handles documents that are undefined, whilst also
          having a 'null' element in the parameters to $in.
        */
        if (typeof comparableB == 'undefined') {
          for (var i = a.length; i--;) {
            if (a[i] == null) {
              return true;
            }
          }
        }

        /*
          Handles the case of {'field': {$in: [/regexp1/, /regexp2/, ...]}}
        */
        for (var i = a.length; i--;) {
          var validator = createRootValidator(get(a, i), undefined);
          var result = validate(validator, b, i, a);
          if ((result) && (String(result) !== '[object Object]') && (String(b) !== '[object Object]')) {
            return true;
          }
        }

        return !!~a.indexOf(comparableB);
      }

      return false;
    },

    /**
     */

    $nin: function(a, b, k, o) {
      return !OPERATORS.$in(a, b, k, o);
    },

    /**
     */

    $not: function(a, b, k, o) {
      return !validate(a, b, k, o);
    },

    /**
     */

    $type: function(a, b) {
      return b != void 0 ? b instanceof a || b.constructor == a : false;
     },

    /**
     */

    $all: function(a, b, k, o) {
      return OPERATORS.$and(a, b, k, o);
    },

    /**
     */

    $size: function(a, b) {
      return b ? a === b.length : false;
    },

    /**
     */

    $or: function(a, b, k, o) {
      for (var i = 0, n = a.length; i < n; i++) if (validate(get(a, i), b, k, o)) return true;
      return false;
    },

    /**
     */

    $nor: function(a, b, k, o) {
      return !OPERATORS.$or(a, b, k, o);
    },

    /**
     */

    $and: function(a, b, k, o) {
      for (var i = 0, n = a.length; i < n; i++) {
        if (!validate(get(a, i), b, k, o)) {
          return false;
        }
      }
      return true;
    },

    /**
     */

    $regex: or(function(a, b) {
      return typeof b === 'string' && a.test(b);
    }),

    /**
     */

    $where: function(a, b, k, o) {
      return a.call(b, b, k, o);
    },

    /**
     */

    $elemMatch: function(a, b, k, o) {
      if (isArray(b)) {
        return !!~search(b, a);
      }
      return validate(a, b, k, o);
    },

    /**
     */

    $exists: function(a, b, k, o) {
      return o.hasOwnProperty(k) === a;
    }
  };

  /**
   */

  var prepare = {

    /**
     */

    $eq: function(a) {

      if (a instanceof RegExp) {
        return function(b) {
          return typeof b === 'string' && a.test(b);
        };
      } else if (a instanceof Function) {
        return a;
      } else if (isArray(a) && !a.length) {
        // Special case of a == []
        return function(b) {
          return (isArray(b) && !b.length);
        };
      } else if (a === null){
        return function(b){
          //will match both null and undefined
          return b == null;
        }
      }

      return function(b) {
        return sift.compare(comparable(b), a) === 0;
      };
    },

    /**
     */

    $ne: function(a) {
      return prepare.$eq(a);
    },

    /**
     */

    $and: function(a) {
      return a.map(parse);
    },

    /**
     */

    $all: function(a) {
      return prepare.$and(a);
    },

    /**
     */

    $or: function(a) {
      return a.map(parse);
    },

    /**
     */

    $nor: function(a) {
      return a.map(parse);
    },

    /**
     */

    $not: function(a) {
      return parse(a);
    },

    /**
     */

    $regex: function(a, query) {
      return new RegExp(a, query.$options);
    },

    /**
     */

    $where: function(a) {
      return typeof a === 'string' ? new Function('obj', 'return ' + a) : a;
    },

    /**
     */

    $elemMatch: function(a) {
      return parse(a);
    },

    /**
     */

    $exists: function(a) {
      return !!a;
    }
  };

  /**
   */

  function search(array, validator) {

    for (var i = 0; i < array.length; i++) {
      var result = get(array, i);
      if (validate(validator, get(array, i))) {
        return i;
      }
    }

    return -1;
  }

  /**
   */

  function createValidator(a, validate) {
    return { a: a, v: validate };
  }

  /**
   */

  function nestedValidator(a, b) {
    var values  = [];
    findValues(b, a.k, 0, b, values);

    if (values.length === 1) {
      var first = values[0];
      return validate(a.nv, first[0], first[1], first[2]);
    }

    for (var i = 0; i < values.length; i++) {
      var result = values[i];
      if (validate(a.nv, result[0], result[1], result[2])) {
        return true;
      }
    }

    return false;
  }

  /**
   */

  function findValues(current, keypath, index, object, values) {

    if (index === keypath.length || current == void 0) {
      values.push([current, keypath[index - 1], object]);
      return;
    }

    var k = get(keypath, index);

    // ensure that if current is an array, that the current key
    // is NOT an array index. This sort of thing needs to work:
    // sift({'foo.0':42}, [{foo: [42]}]);
    if (isArray(current) && isNaN(Number(k))) {
      for (var i = 0, n = current.length; i < n; i++) {
        findValues(get(current, i), keypath, index, current, values);
      }
    } else {
      findValues(get(current, k), keypath, index + 1, current, values);
    }
  }

  /**
   */

  function createNestedValidator(keypath, a) {
    return { a: { k: keypath, nv: a }, v: nestedValidator };
  }

  /**
   * flatten the query
   */

  function isVanillaObject(value) {
    return value && value.constructor === Object;
  }

  function parse(query) {
    query = comparable(query);

    if (!query || !isVanillaObject(query)) { // cross browser support
      query = { $eq: query };
    }

    var validators = [];

    for (var key in query) {
      var a = query[key];

      if (key === '$options') {
        continue;
      }

      if (OPERATORS[key]) {
        if (prepare[key]) a = prepare[key](a, query);
        validators.push(createValidator(comparable(a), OPERATORS[key]));
      } else {

        if (key.charCodeAt(0) === 36) {
          throw new Error('Unknown operation ' + key);
        }

        validators.push(createNestedValidator(key.split('.'), parse(a)));
      }
    }

    return validators.length === 1 ? validators[0] : createValidator(validators, OPERATORS.$and);
  }

  /**
   */

  function createRootValidator(query, getter) {
    var validator = parse(query);
    if (getter) {
      validator = {
        a: validator,
        v: function(a, b, k, o) {
          return validate(a, getter(b), k, o);
        }
      };
    }
    return validator;
  }

  /**
   */

  function sift(query, array, getter) {

    if (isFunction(array)) {
      getter = array;
      array  = void 0;
    }

    var validator = createRootValidator(query, getter);

    function filter(b, k, o) {
      return validate(validator, b, k, o);
    }

    if (array) {
      return array.filter(filter);
    }

    return filter;
  }

  /**
   */

  sift.use = function(plugin) {
    if (isFunction(plugin)) return plugin(sift);
    for (var key in plugin) {
      /* istanbul ignore else */
      if (key.charCodeAt(0) === 36) {
        OPERATORS[key] = plugin[key];
      }
    }
  };

  /**
   */

  sift.indexOf = function(query, array, getter) {
    return search(array, createRootValidator(query, getter));
  };

  /**
   */

  sift.compare = function(a, b) {
    if(a===b) return 0;
    if(typeof a === typeof b) {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
    }
  };

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    module.exports = sift;
    exports['default'] = module.exports.default = sift;
  }

  /* istanbul ignore next */
  if (typeof window !== 'undefined') {
    window.sift = sift;
  }
})();


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(6);

var empty = /*#__PURE__*/__webpack_require__(66);

var equals = /*#__PURE__*/__webpack_require__(70);

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);   //=> false
 *      R.isEmpty([]);          //=> true
 *      R.isEmpty('');          //=> true
 *      R.isEmpty(null);        //=> false
 *      R.isEmpty({});          //=> true
 *      R.isEmpty({length: 0}); //=> false
 */


var isEmpty = /*#__PURE__*/_curry1(function isEmpty(x) {
  return x != null && equals(x, empty(x));
});
module.exports = isEmpty;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(6);

var _isArguments = /*#__PURE__*/__webpack_require__(23);

var _isArray = /*#__PURE__*/__webpack_require__(67);

var _isObject = /*#__PURE__*/__webpack_require__(68);

var _isString = /*#__PURE__*/__webpack_require__(69);

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));      //=> Nothing()
 *      R.empty([1, 2, 3]);     //=> []
 *      R.empty('unicorns');    //=> ''
 *      R.empty({x: 1, y: 2});  //=> {}
 */


var empty = /*#__PURE__*/_curry1(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
    return arguments;
  }() :
  // else
  void 0;
});
module.exports = empty;

/***/ }),
/* 67 */
/***/ (function(module, exports) {

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
module.exports = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

/***/ }),
/* 68 */
/***/ (function(module, exports) {

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}
module.exports = _isObject;

/***/ }),
/* 69 */
/***/ (function(module, exports) {

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}
module.exports = _isString;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var _curry2 = /*#__PURE__*/__webpack_require__(24);

var _equals = /*#__PURE__*/__webpack_require__(71);

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      var a = {}; a.v = a;
 *      var b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */


var equals = /*#__PURE__*/_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});
module.exports = equals;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var _arrayFromIterator = /*#__PURE__*/__webpack_require__(72);

var _containsWith = /*#__PURE__*/__webpack_require__(73);

var _functionName = /*#__PURE__*/__webpack_require__(74);

var _has = /*#__PURE__*/__webpack_require__(11);

var identical = /*#__PURE__*/__webpack_require__(75);

var keys = /*#__PURE__*/__webpack_require__(76);

var type = /*#__PURE__*/__webpack_require__(19);

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);
  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  }

  // if *a* array contains any element that is not included in *b*
  return !_containsWith(function (b, aItem) {
    return !_containsWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (identical(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }
      break;
    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case 'Date':
      if (!identical(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }
      break;
  }

  var idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;
    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);
  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);

  idx = keysA.length - 1;
  while (idx >= 0) {
    var key = keysA[idx];
    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }
    idx -= 1;
  }
  return true;
}
module.exports = _equals;

/***/ }),
/* 72 */
/***/ (function(module, exports) {

function _arrayFromIterator(iter) {
  var list = [];
  var next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}
module.exports = _arrayFromIterator;

/***/ }),
/* 73 */
/***/ (function(module, exports) {

function _containsWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}
module.exports = _containsWith;

/***/ }),
/* 74 */
/***/ (function(module, exports) {

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}
module.exports = _functionName;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

var _curry2 = /*#__PURE__*/__webpack_require__(24);

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`;
 * `0` and `-0` are not identical.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      var o = {};
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */


var identical = /*#__PURE__*/_curry2(function identical(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
});
module.exports = identical;

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(6);

var _has = /*#__PURE__*/__webpack_require__(11);

var _isArguments = /*#__PURE__*/__webpack_require__(23);

// cover IE < 9 keys issues


var hasEnumBug = ! /*#__PURE__*/{ toString: null }.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// Safari bug
var hasArgsEnumBug = /*#__PURE__*/function () {
  'use strict';

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;
  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }
    idx += 1;
  }
  return false;
};

/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
var _keys = typeof Object.keys === 'function' && !hasArgsEnumBug ? function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
} : function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }
  var prop, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }
  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;
    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];
      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }
      nIdx -= 1;
    }
  }
  return ks;
};
var keys = /*#__PURE__*/_curry1(_keys);
module.exports = keys;

/***/ })
/******/ ]);
//# sourceMappingURL=scorecard.js.map