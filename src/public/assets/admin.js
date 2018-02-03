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
/******/ 	return __webpack_require__(__webpack_require__.s = 87);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 1:
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

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.editor-wrapper[data-v-16a19b5a] {\r\n    width: 100%;\r\n    overflow-x: scroll;\n}\n.editor-list[data-v-16a19b5a] {\r\n    display: table;\r\n    border-collapse: collapse;\r\n    width: 100%;\r\n    justify-content: space-between;\r\n    flex-direction: row;\r\n    /* margin: 1em; */\n}\n.editor-list .row[data-v-16a19b5a] {\r\n    height: 3em;\n}\nth[data-v-16a19b5a], td[data-v-16a19b5a] {\r\n    padding: 0 0.5em;\r\n    min-width: 120px;\n}\nth[data-v-16a19b5a] {\r\n    text-align: left;\n}\ntd[data-v-16a19b5a] {\r\n    border-bottom: 1px solid hsl(211, 8%, 72%);\r\n    align-items: center;\r\n    height: 3em;\n}\n.editor-wrapper button[data-v-16a19b5a] {\r\n    box-sizing: border-box;\r\n    color: black;\r\n    border: 4px solid #444;\r\n    border-radius: 6px;\r\n    min-width: 80px;\n}\n.editor-wrapper button[data-v-16a19b5a]:hover {\r\n    background-color: white;\n}\n.editor-list .save-button[data-v-16a19b5a] {\n}\n.editor-wrapper .add-button[data-v-16a19b5a] {\r\n    font-size: 2em;\r\n    font-weight: lighter;\r\n    color: hsl(208, 57%, 62%);\n}\r\n", "", {"version":3,"sources":["C:/Users/nclonts/Documents/Rise/dashboard/five9-call-dashboard/src/public/components/src/public/components/api-editor-table.vue?625aa431"],"names":[],"mappings":";AAmGA;IACA,YAAA;IACA,mBAAA;CACA;AACA;IACA,eAAA;IACA,0BAAA;IACA,YAAA;IACA,+BAAA;IACA,oBAAA;IACA,kBAAA;CACA;AACA;IACA,YAAA;CACA;AACA;IACA,iBAAA;IACA,iBAAA;CACA;AACA;IACA,iBAAA;CACA;AACA;IACA,2CAAA;IACA,oBAAA;IACA,YAAA;CACA;AACA;IACA,uBAAA;IACA,aAAA;IACA,uBAAA;IACA,mBAAA;IACA,gBAAA;CACA;AACA;IACA,wBAAA;CACA;AACA;CAEA;AACA;IACA,eAAA;IACA,qBAAA;IACA,0BAAA;CACA","file":"api-editor-table.vue","sourcesContent":["/**\r\n * Creates a table used to modify data through API functions.\r\n *\r\n * The parent template is responsible for rendering table fields. See:\r\n *  https://vuejs.org/v2/guide/components.html#Scoped-Slots\r\n * for documentation, or ../scorecard-admin.html for example usage.\r\n *\r\n * Save and Delete buttons are included with each item's row.\r\n *\r\n *  Component properties:\r\n * @prop {Function} updater(item: new object) - API function to update an item on server\r\n * @prop {Function} loader() - API function to load items from server\r\n * @prop {Array} headers - array of string header names.\r\n */\r\n\r\n<template>\r\n    <div class=\"editor-wrapper\">\r\n        <table class=\"editor-list\">\r\n            <thead>\r\n                <tr>\r\n                    <th v-for=\"header in headers\">\r\n                        {{ header }}\r\n                    </th>\r\n                    <th>Save Changes</th>\r\n                </tr>\r\n            </thead>\r\n            <tr class=\"row\" v-for=\"(item, i) in items\">\r\n                <slot name=\"item\" :item=\"item\">\r\n                    <p>\r\n                        This is just a dang filler! Use\r\n                        <a target=\"_blank\"\r\n                        href=\"https://vuejs.org/v2/guide/components.html#Scoped-Slots\">\r\n                          slot-scope</a>\r\n                        to render `td` elements in parent.\r\n                    </p>\r\n                </slot>\r\n\r\n                <td>\r\n                    <button class=\"save-button\" title=\"Save changes\"\r\n                        @click=\"update(item)\"\r\n                    >Save</button>\r\n                </td>\r\n                <td>\r\n                    <button class=\"delete-button\" title=\"Permanently delete row\"\r\n                        @click=\"remove(item)\"\r\n                    >Delete</button>\r\n                </td>\r\n            </tr>\r\n        </table>\r\n\r\n        <button class=\"add-button\" title=\"Add a new row\"\r\n            @click=\"addRow\"\r\n        >+</button>\r\n    </div>\r\n</template>\r\n\r\n\r\n<script>\r\nexport default {\r\n    props: ['updater', 'loader', 'adder', 'remover', 'headers'],\r\n\r\n    data: function() {\r\n        return {\r\n            items: []\r\n        }\r\n    },\r\n\r\n    components: {},\r\n\r\n    beforeMount: function() {\r\n        this.load();\r\n    },\r\n\r\n    methods: {\r\n        update: async function(item) {\r\n            this.$emit('message', `Updating ${item.name}...`);\r\n            const message = await this.updater(item);\r\n            this.$emit('message', message);\r\n        },\r\n        load: async function() {\r\n            this.items = await this.loader();\r\n        },\r\n        addRow: function() {\r\n            let newItem = this.adder();\r\n            this.items.push(newItem);\r\n        },\r\n        remove: async function(item) {\r\n            this.$emit('message', `Deleting ${item.name}...`);\r\n            const message = await this.remover(item);\r\n            this.$emit('message', message);\r\n            // Remove item from array\r\n            this.items = this.items.filter((el) => el !== item);\r\n        }\r\n    }\r\n}\r\n</script>\r\n\r\n\r\n<style scoped>\r\n.editor-wrapper {\r\n    width: 100%;\r\n    overflow-x: scroll;\r\n}\r\n.editor-list {\r\n    display: table;\r\n    border-collapse: collapse;\r\n    width: 100%;\r\n    justify-content: space-between;\r\n    flex-direction: row;\r\n    /* margin: 1em; */\r\n}\r\n.editor-list .row {\r\n    height: 3em;\r\n}\r\nth, td {\r\n    padding: 0 0.5em;\r\n    min-width: 120px;\r\n}\r\nth {\r\n    text-align: left;\r\n}\r\ntd {\r\n    border-bottom: 1px solid hsl(211, 8%, 72%);\r\n    align-items: center;\r\n    height: 3em;\r\n}\r\n.editor-wrapper button {\r\n    box-sizing: border-box;\r\n    color: black;\r\n    border: 4px solid #444;\r\n    border-radius: 6px;\r\n    min-width: 80px;\r\n}\r\n.editor-wrapper button:hover {\r\n    background-color: white;\r\n}\r\n.editor-list .save-button {\r\n\r\n}\r\n.editor-wrapper .add-button {\r\n    font-size: 2em;\r\n    font-weight: lighter;\r\n    color: hsl(208, 57%, 62%);\r\n}\r\n</style>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ 11:
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
//
//
//
//
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
  props: ['updater', 'loader', 'adder', 'remover', 'headers'],
  data: function () {
    return {
      items: []
    };
  },
  components: {},
  beforeMount: function () {
    this.load();
  },
  methods: {
    update: async function (item) {
      this.$emit('message', `Updating ${item.name}...`);
      const message = await this.updater(item);
      this.$emit('message', message);
    },
    load: async function () {
      this.items = await this.loader();
    },
    addRow: function () {
      let newItem = this.adder();
      this.items.push(newItem);
    },
    remove: async function (item) {
      this.$emit('message', `Deleting ${item.name}...`);
      const message = await this.remover(item);
      this.$emit('message', message); // Remove item from array

      this.items = this.items.filter(el => el !== item);
    }
  }
});

/***/ }),

/***/ 12:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "editor-wrapper" }, [
    _c(
      "table",
      { staticClass: "editor-list" },
      [
        _c("thead", [
          _c(
            "tr",
            [
              _vm._l(_vm.headers, function(header) {
                return _c("th", [
                  _vm._v(
                    "\n                    " +
                      _vm._s(header) +
                      "\n                "
                  )
                ])
              }),
              _vm._v(" "),
              _c("th", [_vm._v("Save Changes")])
            ],
            2
          )
        ]),
        _vm._v(" "),
        _vm._l(_vm.items, function(item, i) {
          return _c(
            "tr",
            { staticClass: "row" },
            [
              _vm._t("item", [_vm._m(0, true, false)], { item: item }),
              _vm._v(" "),
              _c("td", [
                _c(
                  "button",
                  {
                    staticClass: "save-button",
                    attrs: { title: "Save changes" },
                    on: {
                      click: function($event) {
                        _vm.update(item)
                      }
                    }
                  },
                  [_vm._v("Save")]
                )
              ]),
              _vm._v(" "),
              _c("td", [
                _c(
                  "button",
                  {
                    staticClass: "delete-button",
                    attrs: { title: "Permanently delete row" },
                    on: {
                      click: function($event) {
                        _vm.remove(item)
                      }
                    }
                  },
                  [_vm._v("Delete")]
                )
              ])
            ],
            2
          )
        })
      ],
      2
    ),
    _vm._v(" "),
    _c(
      "button",
      {
        staticClass: "add-button",
        attrs: { title: "Add a new row" },
        on: { click: _vm.addRow }
      },
      [_vm._v("+")]
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("p", [
      _vm._v(
        "\n                    This is just a dang filler! Use\n                    "
      ),
      _c(
        "a",
        {
          attrs: {
            target: "_blank",
            href: "https://vuejs.org/v2/guide/components.html#Scoped-Slots"
          }
        },
        [_vm._v("\n                      slot-scope")]
      ),
      _vm._v(
        "\n                    to render `td` elements in parent.\n                "
      )
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-16a19b5a", esExports)
  }
}

/***/ }),

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const API_URL = 'http://localhost:3000/api/';
/* harmony export (immutable) */ __webpack_exports__["a"] = API_URL;


/***/ }),

/***/ 3:
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

/***/ 4:
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

var listToStyles = __webpack_require__(6)

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

/***/ 5:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["g"] = getStatistics;
/* harmony export (immutable) */ __webpack_exports__["h"] = queueStats;
/* harmony export (immutable) */ __webpack_exports__["e"] = getReportResults;
/* harmony export (immutable) */ __webpack_exports__["d"] = getFieldList;
/* harmony export (immutable) */ __webpack_exports__["l"] = updateField;
/* harmony export (immutable) */ __webpack_exports__["f"] = getSkillJobs;
/* harmony export (immutable) */ __webpack_exports__["m"] = updateSkillJob;
/* harmony export (immutable) */ __webpack_exports__["b"] = deleteSkillJob;
/* harmony export (immutable) */ __webpack_exports__["c"] = getAdminUsers;
/* harmony export (immutable) */ __webpack_exports__["k"] = updateAdminUser;
/* unused harmony export deleteAdminUser */
/* harmony export (immutable) */ __webpack_exports__["i"] = rebootServer;
/* harmony export (immutable) */ __webpack_exports__["j"] = reloadData;
/* unused harmony export getParameters */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility_js__ = __webpack_require__(1);
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
}
async function getAdminUsers() {
  let response = await request({}, 'users/admin', 'GET');
  return response.json();
}
async function updateAdminUser(user) {
  let response = await request({
    user: user
  }, 'users/admin', 'PUT');
  return response.text();
}
async function deleteAdminUser(user) {
  let response = await request({
    user: user
  }, 'users/admin', 'DELETE');
  return response.text();
}
async function rebootServer() {
  const response = await request({}, 'reboot-server', 'POST');
  return response.text();
}
async function reloadData(params) {
  const response = request(params, 'reload-data', 'POST');
  return response.text();
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
  }

  return params;
}

/***/ }),

/***/ 6:
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

/***/ 8:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_api_editor_table_vue__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_16a19b5a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_api_editor_table_vue__ = __webpack_require__(12);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(9)
}
var normalizeComponent = __webpack_require__(0)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-16a19b5a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_api_editor_table_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_16a19b5a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_api_editor_table_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src\\public\\components\\api-editor-table.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-16a19b5a", Component.options)
  } else {
    hotAPI.reload("data-v-16a19b5a", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(88);


/***/ }),

/***/ 88:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_api_editor_table_vue__ = __webpack_require__(8);
// TODO: move jQuery to Vue

$(document).ready(() => {
  // Listen for server reboot request
  $('.reboot-server').click(async event => {
    $('.message').text(`Computing....`);
    const msg = await __WEBPACK_IMPORTED_MODULE_0__api__["i" /* rebootServer */]();
    $('.message').text(msg);
  }); // Listen for data reload requests

  $('.reload-data').click(async event => {
    $('.message').text(`Computing....`);
    const time = {
      start: $('.start-time').val(),
      end: $('.end-time').val()
    };
    const body = {
      time: time
    };
    const msg = await __WEBPACK_IMPORTED_MODULE_0__api__["j" /* reloadData */](body);
    $('.message').text(msg);
  });
}); // Handle Vue form


const vm = new Vue({
  el: '#admin-app',
  components: {
    'api-editor-table': __WEBPACK_IMPORTED_MODULE_1__components_api_editor_table_vue__["a" /* default */]
  },
  data: {
    message: ''
  },
  methods: {
    adminUpdater: async function (user) {
      return __WEBPACK_IMPORTED_MODULE_0__api__["k" /* updateAdminUser */](user);
    },
    adminLoader: async function () {
      const admins = await __WEBPACK_IMPORTED_MODULE_0__api__["c" /* getAdminUsers */]();
    },
    adminAdder: function () {
      return {
        username: ''
      };
    },
    adminRemover: async function (job) {
      return __WEBPACK_IMPORTED_MODULE_0__api__["deleteAdmin"](job);
    },
    updateMessage: function (msg) {
      $('.message').text(msg);
      this.message = msg;
    }
  }
});

/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(4)("3c1253de", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-16a19b5a\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./api-editor-table.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?sourceMap!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-16a19b5a\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0&bustCache!./api-editor-table.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ })

/******/ });
//# sourceMappingURL=admin.js.map