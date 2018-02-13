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
/******/ 	return __webpack_require__(__webpack_require__.s = 89);
/******/ })
/************************************************************************/
/******/ ({

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(90);


/***/ }),

/***/ 90:
/***/ (function(module, exports) {

throw new Error("Module build failed: SyntaxError: C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\src\\public\\javascript\\upload.js: await is a reserved word (25:33)\n\n  23 |             const reader = new FileReader();\n  24 |             reader.onload = function(e) {\n> 25 |                 const response = await api.uploadData(e.target.results);\n     |                                  ^\n  26 |                 this.updateMessage(response);\n  27 |             }.bind(this);\n  28 |             reader.readAsText(file);\n    at Parser.raise (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:832:15)\n    at Parser.checkReservedWord (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4098:12)\n    at Parser.parseIdentifierName (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4067:12)\n    at Parser.parseIdentifier (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4059:21)\n    at Parser.parseExprAtom (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:3224:25)\n    at Parser.parseExprSubscripts (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2972:21)\n    at Parser.parseMaybeUnary (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2950:21)\n    at Parser.parseExprOps (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2855:21)\n    at Parser.parseMaybeConditional (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2825:21)\n    at Parser.parseMaybeAssign (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2781:21)\n    at Parser.parseVar (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4840:26)\n    at Parser.parseVarStatement (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4659:10)\n    at Parser.parseStatementContent (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4260:21)\n    at Parser.parseStatement (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4206:17)\n    at Parser.parseBlockOrModuleBlockBody (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4764:23)\n    at Parser.parseBlockBody (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4750:10)\n    at Parser.parseBlock (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4739:10)\n    at Parser.parseFunctionBody (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:3967:24)\n    at Parser.parseFunctionBodyAndFinish (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:3944:10)\n    at Parser.parseFunction (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4905:10)\n    at Parser.parseFunctionExpression (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:3379:17)\n    at Parser.parseExprAtom (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:3313:21)\n    at Parser.parseExprSubscripts (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2972:21)\n    at Parser.parseMaybeUnary (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2950:21)\n    at Parser.parseExprOps (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2855:21)\n    at Parser.parseMaybeConditional (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2825:21)\n    at Parser.parseMaybeAssign (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2781:21)\n    at Parser.parseMaybeAssign (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2811:27)\n    at Parser.parseExpression (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:2732:21)\n    at Parser.parseStatementContent (C:\\Users\\nclonts\\Documents\\Rise\\dashboard\\five9-call-dashboard\\node_modules\\babylon\\lib\\index.js:4322:21)");

/***/ })

/******/ });
//# sourceMappingURL=upload.js.map