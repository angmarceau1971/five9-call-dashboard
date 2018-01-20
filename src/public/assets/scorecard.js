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
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var _isPlaceholder = /*#__PURE__*/__webpack_require__(14);

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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'https://nathanclonts.com/dashboard/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ }),
/* 3 */
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
/* 4 */
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

var listToStyles = __webpack_require__(22)

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
/* 5 */,
/* 6 */
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
    formattedValue = moment(value).format(field.format.string);
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
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_widget_base_vue__ = __webpack_require__(30);
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_widget_base_vue__["a" /* default */],
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_data_table_vue__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_daa59b00_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_data_table_vue__ = __webpack_require__(39);
function injectStyle (ssrContext) {
  __webpack_require__(24)
}
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_data_table_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_daa59b00_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_data_table_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 9 */
/***/ (function(module, exports) {

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
module.exports = _has;

/***/ }),
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_line_graph_vue__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1ff0287e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_line_graph_vue__ = __webpack_require__(40);
function injectStyle (ssrContext) {
  __webpack_require__(20)
}
var normalizeComponent = __webpack_require__(0)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1ff0287e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_line_graph_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1ff0287e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_line_graph_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(1);

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
/* 14 */
/***/ (function(module, exports) {

function _isPlaceholder(a) {
       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}
module.exports = _isPlaceholder;

/***/ }),
/* 15 */
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var _has = /*#__PURE__*/__webpack_require__(9);

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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(1);

var _isPlaceholder = /*#__PURE__*/__webpack_require__(14);

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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(19);


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_line_graph_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_data_table_vue__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_dashboard_vue__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__scorecard_format_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__local_settings_js__ = __webpack_require__(2);






const isEmpty = __webpack_require__(57);

let ahtData = [{
  "_id": {
    "skill": "DISPATCH_IVR_OPT_OUT_APPT_MT",
    "agentUsername": "user@example.com"
  },
  "calls": 1,
  "handleTime": 154
}, {
  "_id": {
    "skill": "SALES_RES_TRANSFER_NONCOM",
    "agentUsername": "user@example.com"
  },
  "calls": 2,
  "handleTime": 1046
}, {
  "_id": {
    "skill": "RESELLER_RES_SALES_COM",
    "agentUsername": "user@example.com"
  },
  "calls": 1,
  "handleTime": 63
}, {
  "_id": {
    "skill": "SALES_RES_VENDOR_TRANSFER_NONCOM",
    "agentUsername": "user@example.com"
  },
  "calls": 1,
  "handleTime": 524
}, {
  "_id": {
    "skill": "DISPATCH_IVR_OPT_OUT_APPT_CT",
    "agentUsername": "user@example.com"
  },
  "calls": 2,
  "handleTime": 471
}, {
  "_id": {
    "skill": "SALES_RES_COM",
    "agentUsername": "user@example.com"
  },
  "calls": 16,
  "handleTime": 7790
}, {
  "_id": {
    "skill": "SALES_RES_SCHEDULE_FUTURE_NONCOM",
    "agentUsername": "user@example.com"
  },
  "calls": 1,
  "handleTime": 10
}, {
  "_id": {
    "skill": "SALES_SMB_COM",
    "agentUsername": "user@example.com"
  },
  "calls": 1,
  "handleTime": 226
}, {
  "_id": {
    "skill": "SALES_RES_FUTURE_NONCOM",
    "agentUsername": "user@example.com"
  },
  "calls": 4,
  "handleTime": 1200
}, {
  "_id": {
    "skill": "CARE_QUESTIONS",
    "agentUsername": "user@example.com"
  },
  "calls": 3,
  "handleTime": 1151
}];
let productivityData = [{
  "Date": "2017-11-01",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-02",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-03",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-04",
  "Productivity": "0.92"
}, {
  "Date": "2017-11-05",
  "Productivity": "0.84"
}, {
  "Date": "2017-11-06",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-07",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-08",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-09",
  "Productivity": "0.93"
}, {
  "Date": "2017-11-10",
  "Productivity": "0.93"
}, {
  "Date": "2017-11-11",
  "Productivity": "0.87"
}, {
  "Date": "2017-11-12",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-13",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-14",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-15",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-16",
  "Productivity": "0.84"
}, {
  "Date": "2017-11-17",
  "Productivity": "0.93"
}, {
  "Date": "2017-11-18",
  "Productivity": "0.92"
}, {
  "Date": "2017-11-19",
  "Productivity": "0.84"
}, {
  "Date": "2017-11-20",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-21",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-22",
  "Productivity": "0.86"
}, {
  "Date": "2017-11-23",
  "Productivity": "0.79"
}, {
  "Date": "2017-11-24",
  "Productivity": "0.88"
}, {
  "Date": "2017-11-25",
  "Productivity": "0.90"
}, {
  "Date": "2017-11-26",
  "Productivity": "0.80"
}, {
  "Date": "2017-11-27",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-28",
  "Productivity": "N/A"
}, {
  "Date": "2017-11-29",
  "Productivity": "0.83"
}, {
  "Date": "2017-11-30",
  "Productivity": "0.83"
}];
let dtvData = [{
  "Date": "2017-11-01",
  "DIRECTV Sales": "2",
  "Rolling Total": "2",
  "Pacing": "1.36",
  "Delta": "1"
}, {
  "Date": "2017-11-02",
  "DIRECTV Sales": "0",
  "Rolling Total": "2",
  "Pacing": "2.73",
  "Delta": "-1"
}, {
  "Date": "2017-11-03",
  "DIRECTV Sales": "1",
  "Rolling Total": "3",
  "Pacing": "4.09",
  "Delta": "-1"
}, {
  "Date": "2017-11-04",
  "DIRECTV Sales": "4",
  "Rolling Total": "7",
  "Pacing": "5.45",
  "Delta": "2"
}, {
  "Date": "2017-11-05",
  "DIRECTV Sales": "4",
  "Rolling Total": "11",
  "Pacing": "6.82",
  "Delta": "4"
}, {
  "Date": "2017-11-06",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "11",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-07",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "11",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-08",
  "DIRECTV Sales": "3",
  "Rolling Total": "14",
  "Pacing": "8.18",
  "Delta": "6"
}, {
  "Date": "2017-11-09",
  "DIRECTV Sales": "3",
  "Rolling Total": "17",
  "Pacing": "9.55",
  "Delta": "7"
}, {
  "Date": "2017-11-10",
  "DIRECTV Sales": "0",
  "Rolling Total": "17",
  "Pacing": "10.91",
  "Delta": "6"
}, {
  "Date": "2017-11-11",
  "DIRECTV Sales": "4",
  "Rolling Total": "21",
  "Pacing": "12.27",
  "Delta": "9"
}, {
  "Date": "2017-11-12",
  "DIRECTV Sales": "0",
  "Rolling Total": "21",
  "Pacing": "13.64",
  "Delta": "7"
}, {
  "Date": "2017-11-13",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "21",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-14",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "21",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-15",
  "DIRECTV Sales": "2",
  "Rolling Total": "23",
  "Pacing": "15",
  "Delta": "8"
}, {
  "Date": "2017-11-16",
  "DIRECTV Sales": "4",
  "Rolling Total": "27",
  "Pacing": "16.36",
  "Delta": "11"
}, {
  "Date": "2017-11-17",
  "DIRECTV Sales": "0",
  "Rolling Total": "27",
  "Pacing": "17.73",
  "Delta": "9"
}, {
  "Date": "2017-11-18",
  "DIRECTV Sales": "0",
  "Rolling Total": "27",
  "Pacing": "19.09",
  "Delta": "8"
}, {
  "Date": "2017-11-19",
  "DIRECTV Sales": "1",
  "Rolling Total": "28",
  "Pacing": "20.45",
  "Delta": "8"
}, {
  "Date": "2017-11-20",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "28",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-21",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "28",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-22",
  "DIRECTV Sales": "0",
  "Rolling Total": "28",
  "Pacing": "21.82",
  "Delta": "6"
}, {
  "Date": "2017-11-23",
  "DIRECTV Sales": "3",
  "Rolling Total": "31",
  "Pacing": "23.18",
  "Delta": "8"
}, {
  "Date": "2017-11-24",
  "DIRECTV Sales": "0",
  "Rolling Total": "31",
  "Pacing": "24.55",
  "Delta": "6"
}, {
  "Date": "2017-11-25",
  "DIRECTV Sales": "4",
  "Rolling Total": "35",
  "Pacing": "25.91",
  "Delta": "9"
}, {
  "Date": "2017-11-26",
  "DIRECTV Sales": "2",
  "Rolling Total": "37",
  "Pacing": "27.27",
  "Delta": "10"
}, {
  "Date": "2017-11-27",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "37",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-28",
  "DIRECTV Sales": "N/A",
  "Rolling Total": "37",
  "Pacing": "N/A",
  "Delta": "N/A"
}, {
  "Date": "2017-11-29",
  "DIRECTV Sales": "2",
  "Rolling Total": "39",
  "Pacing": "28.64",
  "Delta": "10"
}, {
  "Date": "2017-11-30",
  "DIRECTV Sales": "2",
  "Rolling Total": "41",
  "Pacing": "30",
  "Delta": "11"
}];
let closeRateData = [{
  "Date": "2017-11-01",
  "Close Rate": "0.59",
  "Sales": "24",
  "Calls": "62"
}, {
  "Date": "2017-11-02",
  "Close Rate": "0.50",
  "Sales": "25",
  "Calls": "68"
}, {
  "Date": "2017-11-03",
  "Close Rate": "0.40",
  "Sales": "17",
  "Calls": "42"
}, {
  "Date": "2017-11-04",
  "Close Rate": "0.40",
  "Sales": "25",
  "Calls": "62"
}, {
  "Date": "2017-11-05",
  "Close Rate": "0.37",
  "Sales": "20",
  "Calls": "53"
}, {
  "Date": "2017-11-06",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-07",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-08",
  "Close Rate": "0.51",
  "Sales": "24",
  "Calls": "54"
}, {
  "Date": "2017-11-09",
  "Close Rate": "0.58",
  "Sales": "16",
  "Calls": "28"
}, {
  "Date": "2017-11-10",
  "Close Rate": "0.44",
  "Sales": "20",
  "Calls": "45"
}, {
  "Date": "2017-11-11",
  "Close Rate": "0.57",
  "Sales": "17",
  "Calls": "30"
}, {
  "Date": "2017-11-12",
  "Close Rate": "0.41",
  "Sales": "17",
  "Calls": "41"
}, {
  "Date": "2017-11-13",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-14",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-15",
  "Close Rate": "0.56",
  "Sales": "23",
  "Calls": "41"
}, {
  "Date": "2017-11-16",
  "Close Rate": "0.35",
  "Sales": "18",
  "Calls": "51"
}, {
  "Date": "2017-11-17",
  "Close Rate": "0.41",
  "Sales": "17",
  "Calls": "41"
}, {
  "Date": "2017-11-18",
  "Close Rate": "0.58",
  "Sales": "20",
  "Calls": "35"
}, {
  "Date": "2017-11-19",
  "Close Rate": "0.59",
  "Sales": "15",
  "Calls": "25"
}, {
  "Date": "2017-11-20",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-21",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-22",
  "Close Rate": "0.58",
  "Sales": "25",
  "Calls": "43"
}, {
  "Date": "2017-11-23",
  "Close Rate": "0.44",
  "Sales": "22",
  "Calls": "51"
}, {
  "Date": "2017-11-24",
  "Close Rate": "0.50",
  "Sales": "23",
  "Calls": "46"
}, {
  "Date": "2017-11-25",
  "Close Rate": "0.51",
  "Sales": "22",
  "Calls": "43"
}, {
  "Date": "2017-11-26",
  "Close Rate": "0.36",
  "Sales": "15",
  "Calls": "41"
}, {
  "Date": "2017-11-27",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-28",
  "Close Rate": "N/A",
  "Sales": "0",
  "Calls": "0"
}, {
  "Date": "2017-11-29",
  "Close Rate": "0.38",
  "Sales": "16",
  "Calls": "42"
}, {
  "Date": "2017-11-30",
  "Close Rate": "0.47",
  "Sales": "26",
  "Calls": "55"
}];
const closeRate = {
  title: 'Close Rate',
  id: 'card:0',
  layoutOrder: 0,
  columns: 1
};
closeRate.data = closeRateData;
closeRate.widgets = [{
  'id': 'widget:0',
  'component': 'single-value',
  'title': 'Today',
  'fieldName': 'Close Rate',
  'value': 0.5561
}, {
  'id': 'widget:1',
  'component': 'single-value',
  'title': 'Month to Date',
  'fieldName': 'Close Rate',
  'value': 0.5047
}, {
  'id': 'widget:2',
  'component': 'line-graph',
  'fields': {
    x: 'Date',
    y: 'Close Rate'
  }
}];
const dtv = {
  title: 'DIRECTV Sales',
  id: 'card:1',
  layoutOrder: 1,
  columns: 2
};
dtv.data = dtvData;
dtv.widgets = [{
  'id': 'widget:0',
  'component': 'single-value',
  'title': 'Today',
  'fieldName': 'DIRECTV Sales',
  'value': 1
}, {
  'id': 'widget:1',
  'component': 'single-value',
  'title': 'Month to Date',
  'fieldName': 'DIRECTV Sales',
  'value': 23
}, {
  'id': 'widget:2',
  'component': 'line-graph',
  'fields': {
    x: 'Date',
    y: 'DIRECTV Sales'
  }
}];
const aht = {
  title: 'Average Handle Time',
  id: 'card:2',
  layoutOrder: 2,
  columns: 1,
  datasources: ['AHT']
};
aht.data = ahtData;
aht.widgets = [{
  'id': 'widget:0',
  'component': 'single-value',
  'title': 'Today',
  'fieldName': 'AHT',
  'value': '10:00'
}, {
  'id': 'widget:1',
  'component': 'single-value',
  'title': 'Month to Date',
  'fieldName': 'AHT',
  'value': '09:30'
}, {
  'id': 'widget:2',
  'component': 'line-graph',
  'fields': {
    x: 'Date',
    y: 'AHT'
  }
}];
const layout = {
  cards: [closeRate, dtv, aht]
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
  calculation: 'handleTime / calls',
  hasGoal: true,
  goal: 0,
  goalThresholds: [],
  comparator: '<=',
  descriptor: 'See these tips for ways to lower handle time!',
  format: {
    type: 'Time',
    string: 'mm:ss'
  }
}];
/**
 * Vuex is used to see if app is in edit mode (editMode Boolean), and store
 * field (meta) data.
 * @type {Vuex}
 */

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    fields: fields,
    editMode: true
  },
  getters: {
    field: state => fieldName => {
      return state.fields.find(f => f.fieldName == fieldName);
    }
  },
  mutations: {
    toggleEditMode(state) {
      state.editMode = !state.editMode;
    }

  }
});
const dataValues = {
  'AHT': ahtData
};
const vm = new Vue({
  el: '#app',
  store,
  data: {
    layout: layout,
    datasources: datasources,
    dataValues: dataValues
  },
  components: {
    'dashboard': __WEBPACK_IMPORTED_MODULE_2__components_dashboard_vue__["a" /* default */]
  },
  methods: {
    updateData: function () {},
    postAcd: function () {
      const url = 'statistics';
      const apiURL = __WEBPACK_IMPORTED_MODULE_4__local_settings_js__["a" /* API_URL */] + url; // defined in api_url.js

      const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            agentGroup: {
              $in: ['Customer Care', 'Sales']
            },
            date: {
              start: '2018-01-14T00:00:00',
              end: '2018-01-16T00:00:00'
            }
          }
        })
      };
      return fetch(apiURL, requestOptions).then(async response => {
        // if (response.status == 504) notifyServer504(parameters, url); // debugging
        if (!response.ok) {
          let bodyText = await response.text();
          throw new Error(`Server responded with ${response.status} ${response.statusText}: ${bodyText}`);
        } // console.log(await response.json());


        download((await response.json()), 'data.json', 'text/plain');
        return response;
      }).then(response => {
        return response;
      }).catch(err => {
        console.log(err);
      });
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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(21);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("67ca055c", content, true);

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".line-graph[data-v-1ff0287e]{max-width:100%}.graph-wrap[data-v-1ff0287e]:hover{cursor:pointer}.graph-wrap[data-v-1ff0287e]{height:150px;width:100%}.graph-wrap text[data-v-1ff0287e]{text-anchor:middle;font-size:.8em;fill:#ddd}.content[data-v-1ff0287e],h1[data-v-1ff0287e]{margin-left:20px}label[data-v-1ff0287e]{display:inline-block;width:150px}.line[data-v-1ff0287e]{fill:none;stroke:#4682b4;stroke-linejoin:round;stroke-linecap:round;stroke-width:1.5}.goal-line[data-v-1ff0287e]{fill:none;stroke:#d3d3d3;stroke-opacity:.7;stroke-width:1}.axis[data-v-1ff0287e]{font-size:.5em}.selector[data-v-1ff0287e]{stroke:rgba(185,220,249,.7);stroke-width:1;fill:none}", ""]);

// exports


/***/ }),
/* 22 */
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
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_table_vue__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__ = __webpack_require__(7);
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
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(25);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("03748a92", content, true);

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_table_row_vue__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_base_vue__ = __webpack_require__(7);
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
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_data_table_row_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_11be8914_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_data_table_row_vue__ = __webpack_require__(29);
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_data_table_row_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_11be8914_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_data_table_row_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__javascript_scorecard_format_js__ = __webpack_require__(6);
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
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('tr',{class:{ highlight: _vm.isHighlighted }},_vm._l((_vm.datum),function(val,key){return _c('td',{class:_vm.formatted(val, key).styleClass,on:{"mouseover":function($event){_vm.highlightDate(_vm.datum)},"mouseleave":_vm.unhighlightDate}},[_vm._v("\n        "+_vm._s(_vm.formatted(val, key).value)+"\n    ")])}))}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__editor_vue__ = __webpack_require__(31);
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
  }
});

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_editor_vue__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6a1a53cd_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_editor_vue__ = __webpack_require__(38);
function injectStyle (ssrContext) {
  __webpack_require__(32)
}
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_editor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6a1a53cd_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_editor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(33);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("3bdb1b10", content, true);

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".editor-wrapper{position:absolute;top:0;left:0;width:100%}.editor-wrapper .add-button,.editor-wrapper .edit-button{display:inline;text-decoration:none;position:absolute;font-size:1.25em;color:#fff;margin:4%;width:2em;height:2em;align-content:center;justify-content:center;background-color:hsla(0,0%,39%,.5);border-radius:2em}.editor-wrapper .add-button:hover,.editor-wrapper .edit-button:hover{background-color:hsla(0,0%,39%,.3)}.editor-wrapper .edit-button{top:0;left:0}.editor-wrapper .add-button{top:0;right:0}", ""]);

// exports


/***/ }),
/* 34 */
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
const clone = __webpack_require__(35);

/* harmony default export */ __webpack_exports__["a"] = ({
  props: ['initialObject'],
  data: function () {
    return {
      editingNow: false,
      newObject: {}
    };
  },

  // Create a copy of the passed-in object on creation
  mounted() {
    this.newObject = clone(this.initialObject);
  },

  methods: {
    edit: function () {
      this.editingNow = true;
    },
    add: function () {},
    exit: function (saveChanges) {
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
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var _clone = /*#__PURE__*/__webpack_require__(36);

var _curry1 = /*#__PURE__*/__webpack_require__(1);

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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var _cloneRegExp = /*#__PURE__*/__webpack_require__(37);

var type = /*#__PURE__*/__webpack_require__(13);

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
/* 37 */
/***/ (function(module, exports) {

function _cloneRegExp(pattern) {
                                  return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}
module.exports = _cloneRegExp;

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"editor-wrapper"},[_c('button',{staticClass:"edit-button",on:{"click":_vm.edit}},[_vm._v("☰")]),_vm._v(" "),_c('button',{staticClass:"add-button",on:{"click":_vm.add}},[_vm._v("+")]),_vm._v(" "),(_vm.editingNow)?_c('div',{staticClass:"edit-form modal"},[_c('h1',[_vm._v(_vm._s(_vm.newObject.title))]),_vm._v(" "),_c('h3',[_vm._v("Title")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.newObject.title),expression:"newObject.title"}],domProps:{"value":(_vm.newObject.title)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.newObject, "title", $event.target.value)}}}),_vm._v(" "),_c('h3',[_vm._v("Field")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.newObject.fieldName),expression:"newObject.fieldName"}],domProps:{"value":(_vm.newObject.fieldName)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.newObject, "fieldName", $event.target.value)}}}),_vm._v(" "),_c('div',{staticClass:"button-wrapper"},[_c('button',{on:{"click":function($event){_vm.exit(true)}}},[_vm._v("Save")]),_vm._v(" "),_c('button',{on:{"click":function($event){_vm.exit(false)}}},[_vm._v("Cancel")]),_vm._v(" "),_c('button',{staticClass:"delete",on:{"click":_vm.deleteObject}},[_vm._v("Delete")])])]):_vm._e()])}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"data-table-wrapper",attrs:{"draggable":_vm.$store.state.editMode},on:{"dragstart":_vm.dragstartHandler}},[_c('table',{staticClass:"data-table"},[_c('thead',[_c('tr',_vm._l((_vm.headers),function(header){return _c('th',[_vm._v(_vm._s(header))])}))]),_vm._v(" "),_c('tbody',_vm._l((_vm.data),function(datum,i){return _c("data-table-row",{key:i,tag:"tr",attrs:{"datum":datum,"isHighlighted":_vm.highlightedDate==datum.Date},on:{"hoverDate":_vm.hoverDate,"unhoverDate":_vm.unhoverDate}})}))])])}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"line-graph",attrs:{"draggable":_vm.$store.state.editMode},on:{"dragstart":_vm.dragstartHandler}},[_c('div',{ref:"graph-wrap",staticClass:"graph-wrap"},[_c('svg',{attrs:{"width":_vm.width,"height":_vm.height},on:{"click":_vm.toggleTable,"mousemove":_vm.mouseover,"mouseleave":_vm.mouseleave}},[_c('text',{staticClass:"title",attrs:{"x":55,"y":10}},[_vm._v(_vm._s(_vm.fields.y))]),_vm._v(" "),_c('g',{ref:"yaxis",staticClass:"axis",style:({transform: ("translate(20px," + (_vm.margin.top) + "px)")})}),_vm._v(" "),_c('g',{style:({transform: ("translate(" + (_vm.margin.left) + "px, " + (_vm.margin.top) + "px)")})},[_c('path',{staticClass:"area",attrs:{"d":_vm.paths.area}}),_vm._v(" "),_c('path',{staticClass:"goal-line",attrs:{"d":_vm.paths.goalLine}}),_vm._v(" "),_c('path',{staticClass:"line",attrs:{"d":_vm.paths.line}}),_vm._v(" "),_c('path',{staticClass:"selector",attrs:{"d":_vm.paths.selector}})])])]),_vm._v(" "),(_vm.showTable)?_c('data-table',{attrs:{"data":_vm.data,"highlightedDate":_vm.highlightedDate},on:{"hoverDate":_vm.hoverDate,"unhoverDate":_vm.unhoverDate}}):_vm._e()],1)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_dashboard_vue__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_71690766_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_dashboard_vue__ = __webpack_require__(56);
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_dashboard_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_71690766_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_dashboard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__card_vue__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__card_editor_vue__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__drag_n_drop_sort_js__ = __webpack_require__(15);
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
      this.editedCard = this.layout.cards.find(card => card.id == cardId);
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
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_card_vue__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_039abf4c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_card_vue__ = __webpack_require__(50);
function injectStyle (ssrContext) {
  __webpack_require__(44)
}
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_card_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_039abf4c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_card_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(45);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("1c640709", content, true);

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".card{display:grid;grid-template-columns:1fr;grid-gap:3em}.card>.widget>:first-child{margin-top:0}.card{transition:all 1s;padding:.5em}.card .add-button,.card .edit-button{display:inline;text-decoration:none;position:absolute;font-size:1.25em;color:#fff;margin:4%;width:2em;height:2em;align-content:center;justify-content:center;background-color:hsla(0,0%,39%,.5);border-radius:2em}.card .add-button:hover,.card .edit-button:hover{background-color:hsla(0,0%,39%,.3)}.card .edit-button{top:0;left:0}.card .add-button{top:0;right:0}", ""]);

// exports


/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_table_vue__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__line_graph_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__single_value_vue__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__javascript_scorecard_format__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__drag_n_drop_sort_js__ = __webpack_require__(15);
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
    addWidget: function () {},

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
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_single_value_vue__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aba8b528_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_single_value_vue__ = __webpack_require__(49);
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_single_value_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aba8b528_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_single_value_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__javascript_scorecard_format__ = __webpack_require__(6);
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
  extends: __WEBPACK_IMPORTED_MODULE_0__widget_base_vue__["a" /* default */],
  props: ['value', 'title', 'fieldName'],
  computed: {
    field: function () {
      return this.$store.getters.field(this.fieldName);
    },
    formatted: function () {
      return Object(__WEBPACK_IMPORTED_MODULE_1__javascript_scorecard_format__["a" /* formatValue */])(this.value, this.field);
    }
  },
  methods: {
    modify: function (newWidget) {
      this.$emit('modify-widget', newWidget, this.id);
    }
  }
});

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"single-value",attrs:{"draggable":_vm.$store.state.editMode},on:{"dragstart":_vm.dragstartHandler}},[_c('h3',[_vm._v(_vm._s(_vm.title))]),_vm._v(" "),_c('p',{staticClass:"metric",class:_vm.formatted.styleClass},[_vm._v("\n        "+_vm._s(_vm.formatted.value)+"\n    ")]),_vm._v(" "),(_vm.$store.state.editMode)?_c('editor',{attrs:{"initialObject":_vm.$props},on:{"modify-widget":_vm.modify}}):_vm._e()],1)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"card metric-wrapper stats-box",style:(_vm.gridPositioning),attrs:{"id":_vm.id},on:{"dragover":_vm.dragWidgetHandler,"drop":_vm.dropWidgetHandler}},[_c('h2',{staticClass:"title descriptor",attrs:{"draggable":_vm.$store.state.editMode},on:{"dragstart":_vm.dragstartHandler}},[_vm._v(_vm._s(_vm.title))]),_vm._v(" "),(_vm.$store.state.editMode)?_c('button',{staticClass:"edit-button",on:{"click":function($event){_vm.$emit('edit-card', _vm.id)}}},[_vm._v("☰")]):_vm._e(),_vm._v(" "),(_vm.$store.state.editMode)?_c('button',{staticClass:"add-button",on:{"click":_vm.addWidget}},[_vm._v("+")]):_vm._e(),_vm._v(" "),_vm._l((_vm.widgetsOfType('single-value')),function(widget,i){return _c('single-value',_vm._b({key:widget.id,ref:widget.id,refInFor:true,staticClass:"widget",style:({ order: widget.layoutOrder }),on:{"dragstart-widget":_vm.dragstartWidgetHandler,"modify-widget":_vm.modifyWidget}},'single-value',widget,false))}),_vm._v(" "),_vm._l((_vm.widgetsOfType('line-graph')),function(widget,i){return _c('line-graph',_vm._b({key:widget.id,ref:widget.id,refInFor:true,staticClass:"widget",style:({ order: widget.layoutOrder }),attrs:{"data":_vm.data},on:{"dragstart-widget":_vm.dragstartWidgetHandler}},'line-graph',widget,false))}),_vm._v(" "),_vm._l((_vm.widgetsOfType('data-table')),function(widget,i){return _c('data-table',_vm._b({key:widget.id,ref:widget.id,refInFor:true,staticClass:"widget",style:({ order: widget.layoutOrder }),attrs:{"data":_vm.data,"highlightedDate":_vm.highlightedDate},on:{"hoverDate":_vm.hoverDate,"unhoverDate":_vm.unhoverDate,"dragstart-widget":_vm.dragstartWidgetHandler}},'data-table',widget,false))})],2)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_card_editor_vue__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0f588edf_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_card_editor_vue__ = __webpack_require__(55);
function injectStyle (ssrContext) {
  __webpack_require__(52)
}
var normalizeComponent = __webpack_require__(0)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_card_editor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0f588edf_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_card_editor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(53);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("0fa31c5b", content, true);

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 54 */
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
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"modal"},[_c('h1',[_vm._v(_vm._s(_vm.newCard.title))]),_vm._v(" "),_c('h3',[_vm._v("Title")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.newCard.title),expression:"newCard.title"}],domProps:{"value":(_vm.newCard.title)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.newCard, "title", $event.target.value)}}}),_vm._v(" "),_c('div',{staticClass:"button-wrapper"},[_c('button',{on:{"click":function($event){_vm.$emit('exit-edit', true, _vm.newCard.id, _vm.newCard)}}},[_vm._v("Save")]),_vm._v(" "),_c('button',{on:{"click":function($event){_vm.$emit('exit-edit', false)}}},[_vm._v("Cancel")]),_vm._v(" "),_c('button',{staticClass:"delete",on:{"click":function($event){_vm.$emit('delete-card', _vm.id)}}},[_vm._v("Delete")])])])}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"dashboard scorecard-wrapper",on:{"dragover":_vm.dragoverHandler,"drop":_vm.dropHandler}},[_vm._l((_vm.layout.cards),function(card,i){return _c('card',_vm._b({key:i,ref:card.id,refInFor:true,on:{"edit-card":_vm.editCard,"modify-widget":_vm.modifyWidget,"update-widgets":_vm.updateWidgets}},'card',card,false))}),_vm._v(" "),(_vm.editingCard)?_c('card-editor',_vm._b({on:{"exit-edit":_vm.exitEdit,"delete-card":_vm.deleteCard}},'card-editor',_vm.editedCard,false)):_vm._e()],2)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(1);

var empty = /*#__PURE__*/__webpack_require__(58);

var equals = /*#__PURE__*/__webpack_require__(62);

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
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(1);

var _isArguments = /*#__PURE__*/__webpack_require__(16);

var _isArray = /*#__PURE__*/__webpack_require__(59);

var _isObject = /*#__PURE__*/__webpack_require__(60);

var _isString = /*#__PURE__*/__webpack_require__(61);

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
/* 59 */
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
/* 60 */
/***/ (function(module, exports) {

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}
module.exports = _isObject;

/***/ }),
/* 61 */
/***/ (function(module, exports) {

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}
module.exports = _isString;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var _curry2 = /*#__PURE__*/__webpack_require__(17);

var _equals = /*#__PURE__*/__webpack_require__(63);

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
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var _arrayFromIterator = /*#__PURE__*/__webpack_require__(64);

var _containsWith = /*#__PURE__*/__webpack_require__(65);

var _functionName = /*#__PURE__*/__webpack_require__(66);

var _has = /*#__PURE__*/__webpack_require__(9);

var identical = /*#__PURE__*/__webpack_require__(67);

var keys = /*#__PURE__*/__webpack_require__(68);

var type = /*#__PURE__*/__webpack_require__(13);

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
/* 64 */
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
/* 65 */
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
/* 66 */
/***/ (function(module, exports) {

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}
module.exports = _functionName;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var _curry2 = /*#__PURE__*/__webpack_require__(17);

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
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var _curry1 = /*#__PURE__*/__webpack_require__(1);

var _has = /*#__PURE__*/__webpack_require__(9);

var _isArguments = /*#__PURE__*/__webpack_require__(16);

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