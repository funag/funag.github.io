/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by tushar.mathur on 24/04/16.
	 */
	
	'use strict';
	
	var _swToolbox = __webpack_require__(1);
	
	var _swToolbox2 = _interopRequireDefault(_swToolbox);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var swConfig = ({"env":"development","port":9000,"sw":{"debug":true,"preCache":false,"appCache":{"policy":"networkFirst"},"externalCache":{"policy":"fastest"}},"express":{"useGzipped":false},"webpack":{"devtool":"#inline-source-map","middleware":true,"optimizeJS":false,"compression":false}}).sw;
	
	if (swConfig.appCache) {
	  var policy = swConfig.appCache.policy;
	
	  _swToolbox2.default.router.get('/', _swToolbox2.default[policy]);
	  _swToolbox2.default.router.get(/.*bundle.*/, _swToolbox2.default[policy]);
	}
	
	if (swConfig.externalCache) {
	  var _policy = swConfig.externalCache.policy;
	
	  _swToolbox2.default.router.get(/^.*googleapis.*$/, _swToolbox2.default[_policy]);
	  _swToolbox2.default.router.get(/^.*gstatic.*$/, _swToolbox2.default[_policy]);
	  _swToolbox2.default.router.get(/^.*bootstrapcdn.*$/, _swToolbox2.default[_policy]);
	  _swToolbox2.default.router.get(/^.*snd\.cdn.*$/, _swToolbox2.default[_policy]);
	}
	
	_swToolbox2.default.router.default = _swToolbox2.default.fastest;
	if (swConfig.debug) {
	  _swToolbox2.default.options.debug = true;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Copyright 2014 Google Inc. All Rights Reserved.
	
	  Licensed under the Apache License, Version 2.0 (the "License");
	  you may not use this file except in compliance with the License.
	  You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
	  Unless required by applicable law or agreed to in writing, software
	  distributed under the License is distributed on an "AS IS" BASIS,
	  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	  See the License for the specific language governing permissions and
	  limitations under the License.
	*/
	'use strict';
	
	__webpack_require__(2);
	var options = __webpack_require__(3);
	var router = __webpack_require__(4);
	var helpers = __webpack_require__(8);
	var strategies = __webpack_require__(10);
	
	helpers.debug('Service Worker Toolbox is loading');
	
	// Install
	
	var flatten = function(items) {
	  return items.reduce(function(a, b) {
	    return a.concat(b);
	  }, []);
	};
	
	self.addEventListener('install', function(event) {
	  var inactiveCache = options.cache.name + '$$$inactive$$$';
	  helpers.debug('install event fired');
	  helpers.debug('creating cache [' + inactiveCache + ']');
	  event.waitUntil(
	    helpers.openCache({cache: {name: inactiveCache}}).then(function(cache) {
	      return Promise.all(options.preCacheItems)
	        .then(flatten)
	        .then(function(preCacheItems) {
	          helpers.debug('preCache list: ' +
	              (preCacheItems.join(', ') || '(none)'));
	          return cache.addAll(preCacheItems);
	        });
	    })
	  );
	});
	
	// Activate
	
	self.addEventListener('activate', function(event) {
	  helpers.debug('activate event fired');
	  var inactiveCache = options.cache.name + '$$$inactive$$$';
	  event.waitUntil(helpers.renameCache(inactiveCache, options.cache.name));
	});
	
	// Fetch
	
	self.addEventListener('fetch', function(event) {
	  var handler = router.match(event.request);
	
	  if (handler) {
	    event.respondWith(handler(event.request));
	  } else if (router.default && event.request.method === 'GET') {
	    event.respondWith(router.default(event.request));
	  }
	});
	
	// Caching
	
	function cache(url, options) {
	  return helpers.openCache(options).then(function(cache) {
	    return cache.add(url);
	  });
	}
	
	function uncache(url, options) {
	  return helpers.openCache(options).then(function(cache) {
	    return cache.delete(url);
	  });
	}
	
	function precache(items) {
	  if (!Array.isArray(items)) {
	    items = [items];
	  }
	  options.preCacheItems = options.preCacheItems.concat(items);
	}
	
	module.exports = {
	  networkOnly: strategies.networkOnly,
	  networkFirst: strategies.networkFirst,
	  cacheOnly: strategies.cacheOnly,
	  cacheFirst: strategies.cacheFirst,
	  fastest: strategies.fastest,
	  router: router,
	  options: options,
	  cache: cache,
	  uncache: uncache,
	  precache: precache
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Copyright 2015 Google Inc. All rights reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function() {
	  var nativeAddAll = Cache.prototype.addAll;
	  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);
	
	  // Has nice behavior of `var` which everyone hates
	  if (userAgent) {
	    var agent = userAgent[1];
	    var version = parseInt(userAgent[2]);
	  }
	
	  if (
	    nativeAddAll && (!userAgent ||
	      (agent === 'Firefox' && version >= 46) ||
	      (agent === 'Chrome'  && version >= 50)
	    )
	  ) {
	    return;
	  }
	
	  Cache.prototype.addAll = function addAll(requests) {
	    var cache = this;
	
	    // Since DOMExceptions are not constructable:
	    function NetworkError(message) {
	      this.name = 'NetworkError';
	      this.code = 19;
	      this.message = message;
	    }
	
	    NetworkError.prototype = Object.create(Error.prototype);
	
	    return Promise.resolve().then(function() {
	      if (arguments.length < 1) throw new TypeError();
	
	      // Simulate sequence<(Request or USVString)> binding:
	      var sequence = [];
	
	      requests = requests.map(function(request) {
	        if (request instanceof Request) {
	          return request;
	        }
	        else {
	          return String(request); // may throw TypeError
	        }
	      });
	
	      return Promise.all(
	        requests.map(function(request) {
	          if (typeof request === 'string') {
	            request = new Request(request);
	          }
	
	          var scheme = new URL(request.url).protocol;
	
	          if (scheme !== 'http:' && scheme !== 'https:') {
	            throw new NetworkError("Invalid scheme");
	          }
	
	          return fetch(request.clone());
	        })
	      );
	    }).then(function(responses) {
	      // If some of the responses has not OK-eish status,
	      // then whole operation should reject
	      if (responses.some(function(response) {
	        return !response.ok;
	      })) {
	        throw new NetworkError('Incorrect response status');
	      }
	
	      // TODO: check that requests don't overwrite one another
	      // (don't think this is possible to polyfill due to opaque responses)
	      return Promise.all(
	        responses.map(function(response, i) {
	          return cache.put(requests[i], response);
	        })
	      );
	    }).then(function() {
	      return undefined;
	    });
	  };
	
	  Cache.prototype.add = function add(request) {
	    return this.addAll([request]);
	  };
	}());

/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		Copyright 2015 Google Inc. All Rights Reserved.
	
		Licensed under the Apache License, Version 2.0 (the "License");
		you may not use this file except in compliance with the License.
		You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
		Unless required by applicable law or agreed to in writing, software
		distributed under the License is distributed on an "AS IS" BASIS,
		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		See the License for the specific language governing permissions and
		limitations under the License.
	*/
	'use strict';
	
	// TODO: This is necessary to handle different implementations in the wild
	// The spec defines self.registration, but it was not implemented in Chrome 40.
	var scope;
	if (self.registration) {
	  scope = self.registration.scope;
	} else {
	  scope = self.scope || new URL('./', self.location).href;
	}
	
	module.exports = {
	  cache: {
	    name: '$$$toolbox-cache$$$' + scope + '$$$',
	    maxAgeSeconds: null,
	    maxEntries: null
	  },
	  debug: false,
	  networkTimeoutSeconds: null,
	  preCacheItems: [],
	  // A regular expression to apply to HTTP response codes. Codes that match
	  // will be considered successes, while others will not, and will not be
	  // cached.
	  successResponses: /^0|([123]\d\d)|(40[14567])|410$/
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Copyright 2014 Google Inc. All Rights Reserved.
	
	  Licensed under the Apache License, Version 2.0 (the "License");
	  you may not use this file except in compliance with the License.
	  You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
	  Unless required by applicable law or agreed to in writing, software
	  distributed under the License is distributed on an "AS IS" BASIS,
	  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	  See the License for the specific language governing permissions and
	  limitations under the License.
	*/
	'use strict';
	
	var Route = __webpack_require__(5);
	
	function regexEscape(s) {
	  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
	
	var keyMatch = function(map, string) {
	  // This would be better written as a for..of loop, but that would break the
	  // minifyify process in the build.
	  var entriesIterator = map.entries();
	  var item = entriesIterator.next();
	  while (!item.done) {
	    var pattern = new RegExp(item.value[0]);
	    if (pattern.test(string)) {
	      return item.value[1];
	    }
	    item = entriesIterator.next();
	  }
	  return null;
	};
	
	var Router = function() {
	  this.routes = new Map();
	  this.default = null;
	};
	
	['get', 'post', 'put', 'delete', 'head', 'any'].forEach(function(method) {
	  Router.prototype[method] = function(path, handler, options) {
	    return this.add(method, path, handler, options);
	  };
	});
	
	Router.prototype.add = function(method, path, handler, options) {
	  options = options || {};
	  var origin;
	
	  if (path instanceof RegExp) {
	    // We need a unique key to use in the Map to distinguish RegExp paths
	    // from Express-style paths + origins. Since we can use any object as the
	    // key in a Map, let's use the RegExp constructor!
	    origin = RegExp;
	  } else {
	    origin = options.origin || self.location.origin;
	    if (origin instanceof RegExp) {
	      origin = origin.source;
	    } else {
	      origin = regexEscape(origin);
	    }
	  }
	
	  method = method.toLowerCase();
	
	  var route = new Route(method, path, handler, options);
	
	  if (!this.routes.has(origin)) {
	    this.routes.set(origin, new Map());
	  }
	
	  var methodMap = this.routes.get(origin);
	  if (!methodMap.has(method)) {
	    methodMap.set(method, new Map());
	  }
	
	  var routeMap = methodMap.get(method);
	  var regExp = route.regexp || route.fullUrlRegExp;
	  routeMap.set(regExp.source, route);
	};
	
	Router.prototype.matchMethod = function(method, url) {
	  var urlObject = new URL(url);
	  var origin = urlObject.origin;
	  var path = urlObject.pathname;
	
	  // We want to first check to see if there's a match against any
	  // "Express-style" routes (string for the path, RegExp for the origin).
	  // Checking for Express-style matches first maintains the legacy behavior.
	  // If there's no match, we next check for a match against any RegExp routes,
	  // where the RegExp in question matches the full URL (both origin and path).
	  return this._match(method, keyMatch(this.routes, origin), path) ||
	    this._match(method, this.routes.get(RegExp), url);
	};
	
	Router.prototype._match = function(method, methodMap, pathOrUrl) {
	  if (methodMap) {
	    var routeMap = methodMap.get(method.toLowerCase());
	    if (routeMap) {
	      var route = keyMatch(routeMap, pathOrUrl);
	      if (route) {
	        return route.makeHandler(pathOrUrl);
	      }
	    }
	  }
	
	  return null;
	};
	
	Router.prototype.match = function(request) {
	  return this.matchMethod(request.method, request.url) ||
	      this.matchMethod('any', request.url);
	};
	
	module.exports = new Router();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Copyright 2014 Google Inc. All Rights Reserved.
	
	  Licensed under the Apache License, Version 2.0 (the "License");
	  you may not use this file except in compliance with the License.
	  You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
	  Unless required by applicable law or agreed to in writing, software
	  distributed under the License is distributed on an "AS IS" BASIS,
	  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	  See the License for the specific language governing permissions and
	  limitations under the License.
	*/
	'use strict';
	
	// TODO: Use self.registration.scope instead of self.location
	var url = new URL('./', self.location);
	var basePath = url.pathname;
	var pathRegexp = __webpack_require__(6);
	
	var Route = function(method, path, handler, options) {
	  if (path instanceof RegExp) {
	    this.fullUrlRegExp = path;
	  } else {
	    // The URL() constructor can't parse express-style routes as they are not
	    // valid urls. This means we have to manually manipulate relative urls into
	    // absolute ones. This check is extremely naive but implementing a tweaked
	    // version of the full algorithm seems like overkill
	    // (https://url.spec.whatwg.org/#concept-basic-url-parser)
	    if (path.indexOf('/') !== 0) {
	      path = basePath + path;
	    }
	
	    this.keys = [];
	    this.regexp = pathRegexp(path, this.keys);
	  }
	
	  this.method = method;
	  this.options = options;
	  this.handler = handler;
	};
	
	Route.prototype.makeHandler = function(url) {
	  var values;
	  if (this.regexp) {
	    var match = this.regexp.exec(url);
	    values = {};
	    this.keys.forEach(function(key, index) {
	      values[key.name] = match[index + 1];
	    });
	  }
	
	  return function(request) {
	    return this.handler(request, values, this.options);
	  }.bind(this);
	};
	
	module.exports = Route;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(7)
	
	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp
	
	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')
	
	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {String} str
	 * @return {Array}
	 */
	function parse (str) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var res
	
	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length
	
	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }
	
	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }
	
	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var suffix = res[6]
	    var asterisk = res[7]
	
	    var repeat = suffix === '+' || suffix === '*'
	    var optional = suffix === '?' || suffix === '*'
	    var delimiter = prefix || '/'
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')
	
	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      pattern: escapeGroup(pattern)
	    })
	  }
	
	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }
	
	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }
	
	  return tokens
	}
	
	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {String}   str
	 * @return {Function}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}
	
	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)
	
	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
	    }
	  }
	
	  return function (obj) {
	    var path = ''
	    var data = obj || {}
	
	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i]
	
	      if (typeof token === 'string') {
	        path += token
	
	        continue
	      }
	
	      var value = data[token.name]
	      var segment
	
	      if (value == null) {
	        if (token.optional) {
	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }
	
	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
	        }
	
	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }
	
	        for (var j = 0; j < value.length; j++) {
	          segment = encodeURIComponent(value[j])
	
	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	          }
	
	          path += (j === 0 ? token.prefix : token.delimiter) + segment
	        }
	
	        continue
	      }
	
	      segment = encodeURIComponent(value)
	
	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }
	
	      path += token.prefix + segment
	    }
	
	    return path
	  }
	}
	
	/**
	 * Escape a regular expression string.
	 *
	 * @param  {String} str
	 * @return {String}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
	}
	
	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}
	
	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}
	
	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {String}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}
	
	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {RegExp} path
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)
	
	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        pattern: null
	      })
	    }
	  }
	
	  return attachKeys(path, keys)
	}
	
	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {Array}  path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []
	
	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }
	
	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))
	
	  return attachKeys(regexp, keys)
	}
	
	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {String} path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path)
	  var re = tokensToRegExp(tokens, options)
	
	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i])
	    }
	  }
	
	  return attachKeys(re, keys)
	}
	
	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {Array}  tokens
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {}
	
	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''
	  var lastToken = tokens[tokens.length - 1]
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)
	
	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]
	
	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = token.pattern
	
	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }
	
	      if (token.optional) {
	        if (prefix) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }
	
	      route += capture
	    }
	  }
	
	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
	  }
	
	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
	  }
	
	  return new RegExp('^' + route, flags(options))
	}
	
	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 [keys]
	 * @param  {Object}                [options]
	 * @return {RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || []
	
	  if (!isarray(keys)) {
	    options = keys
	    keys = []
	  } else if (!options) {
	    options = {}
	  }
	
	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, keys, options)
	  }
	
	  if (isarray(path)) {
	    return arrayToRegexp(path, keys, options)
	  }
	
	  return stringToRegexp(path, keys, options)
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Copyright 2014 Google Inc. All Rights Reserved.
	
	  Licensed under the Apache License, Version 2.0 (the "License");
	  you may not use this file except in compliance with the License.
	  You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
	  Unless required by applicable law or agreed to in writing, software
	  distributed under the License is distributed on an "AS IS" BASIS,
	  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	  See the License for the specific language governing permissions and
	  limitations under the License.
	*/
	'use strict';
	
	var globalOptions = __webpack_require__(3);
	var idbCacheExpiration = __webpack_require__(9);
	
	function debug(message, options) {
	  options = options || {};
	  var flag = options.debug || globalOptions.debug;
	  if (flag) {
	    console.log('[sw-toolbox] ' + message);
	  }
	}
	
	function openCache(options) {
	  var cacheName;
	  if (options && options.cache) {
	    cacheName = options.cache.name;
	  }
	  cacheName = cacheName || globalOptions.cache.name;
	
	  return caches.open(cacheName);
	}
	
	function fetchAndCache(request, options) {
	  options = options || {};
	  var successResponses = options.successResponses ||
	      globalOptions.successResponses;
	
	  return fetch(request.clone()).then(function(response) {
	    // Only cache GET requests with successful responses.
	    // Since this is not part of the promise chain, it will be done
	    // asynchronously and will not block the response from being returned to the
	    // page.
	    if (request.method === 'GET' && successResponses.test(response.status)) {
	      openCache(options).then(function(cache) {
	        cache.put(request, response).then(function() {
	          // If any of the options are provided in options.cache then use them.
	          // Do not fallback to the global options for any that are missing
	          // unless they are all missing.
	          var cacheOptions = options.cache || globalOptions.cache;
	
	          // Only run the cache expiration logic if at least one of the maximums
	          // is set, and if we have a name for the cache that the options are
	          // being applied to.
	          if ((cacheOptions.maxEntries || cacheOptions.maxAgeSeconds) &&
	              cacheOptions.name) {
	            queueCacheExpiration(request, cache, cacheOptions);
	          }
	        });
	      });
	    }
	
	    return response.clone();
	  });
	}
	
	var cleanupQueue;
	function queueCacheExpiration(request, cache, cacheOptions) {
	  var cleanup = cleanupCache.bind(null, request, cache, cacheOptions);
	
	  if (cleanupQueue) {
	    cleanupQueue = cleanupQueue.then(cleanup);
	  } else {
	    cleanupQueue = cleanup();
	  }
	}
	
	function cleanupCache(request, cache, cacheOptions) {
	  var requestUrl = request.url;
	  var maxAgeSeconds = cacheOptions.maxAgeSeconds;
	  var maxEntries = cacheOptions.maxEntries;
	  var cacheName = cacheOptions.name;
	
	  var now = Date.now();
	  debug('Updating LRU order for ' + requestUrl + '. Max entries is ' +
	    maxEntries + ', max age is ' + maxAgeSeconds);
	
	  return idbCacheExpiration.getDb(cacheName).then(function(db) {
	    return idbCacheExpiration.setTimestampForUrl(db, requestUrl, now);
	  }).then(function(db) {
	    return idbCacheExpiration.expireEntries(db, maxEntries, maxAgeSeconds, now);
	  }).then(function(urlsToDelete) {
	    debug('Successfully updated IDB.');
	
	    var deletionPromises = urlsToDelete.map(function(urlToDelete) {
	      return cache.delete(urlToDelete);
	    });
	
	    return Promise.all(deletionPromises).then(function() {
	      debug('Done with cache cleanup.');
	    });
	  }).catch(function(error) {
	    debug(error);
	  });
	}
	
	function renameCache(source, destination, options) {
	  debug('Renaming cache: [' + source + '] to [' + destination + ']', options);
	  return caches.delete(destination).then(function() {
	    return Promise.all([
	      caches.open(source),
	      caches.open(destination)
	    ]).then(function(results) {
	      var sourceCache = results[0];
	      var destCache = results[1];
	
	      return sourceCache.keys().then(function(requests) {
	        return Promise.all(requests.map(function(request) {
	          return sourceCache.match(request).then(function(response) {
	            return destCache.put(request, response);
	          });
	        }));
	      }).then(function() {
	        return caches.delete(source);
	      });
	    });
	  });
	}
	
	module.exports = {
	  debug: debug,
	  fetchAndCache: fetchAndCache,
	  openCache: openCache,
	  renameCache: renameCache
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	/*
	 Copyright 2015 Google Inc. All Rights Reserved.
	
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at
	
	     http://www.apache.org/licenses/LICENSE-2.0
	
	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.
	*/
	'use strict';
	
	var DB_PREFIX = 'sw-toolbox-';
	var DB_VERSION = 1;
	var STORE_NAME = 'store';
	var URL_PROPERTY = 'url';
	var TIMESTAMP_PROPERTY = 'timestamp';
	var cacheNameToDbPromise = {};
	
	function openDb(cacheName) {
	  return new Promise(function(resolve, reject) {
	    var request = indexedDB.open(DB_PREFIX + cacheName, DB_VERSION);
	
	    request.onupgradeneeded = function() {
	      var objectStore = request.result.createObjectStore(STORE_NAME,
	          {keyPath: URL_PROPERTY});
	      objectStore.createIndex(TIMESTAMP_PROPERTY, TIMESTAMP_PROPERTY,
	          {unique: false});
	    };
	
	    request.onsuccess = function() {
	      resolve(request.result);
	    };
	
	    request.onerror = function() {
	      reject(request.error);
	    };
	  });
	}
	
	function getDb(cacheName) {
	  if (!(cacheName in cacheNameToDbPromise)) {
	    cacheNameToDbPromise[cacheName] = openDb(cacheName);
	  }
	
	  return cacheNameToDbPromise[cacheName];
	}
	
	function setTimestampForUrl(db, url, now) {
	  return new Promise(function(resolve, reject) {
	    var transaction = db.transaction(STORE_NAME, 'readwrite');
	    var objectStore = transaction.objectStore(STORE_NAME);
	    objectStore.put({url: url, timestamp: now});
	
	    transaction.oncomplete = function() {
	      resolve(db);
	    };
	
	    transaction.onabort = function() {
	      reject(transaction.error);
	    };
	  });
	}
	
	function expireOldEntries(db, maxAgeSeconds, now) {
	  // Bail out early by resolving with an empty array if we're not using
	  // maxAgeSeconds.
	  if (!maxAgeSeconds) {
	    return Promise.resolve([]);
	  }
	
	  return new Promise(function(resolve, reject) {
	    var maxAgeMillis = maxAgeSeconds * 1000;
	    var urls = [];
	
	    var transaction = db.transaction(STORE_NAME, 'readwrite');
	    var objectStore = transaction.objectStore(STORE_NAME);
	    var index = objectStore.index(TIMESTAMP_PROPERTY);
	
	    index.openCursor().onsuccess = function(cursorEvent) {
	      var cursor = cursorEvent.target.result;
	      if (cursor) {
	        if (now - maxAgeMillis > cursor.value[TIMESTAMP_PROPERTY]) {
	          var url = cursor.value[URL_PROPERTY];
	          urls.push(url);
	          objectStore.delete(url);
	          cursor.continue();
	        }
	      }
	    };
	
	    transaction.oncomplete = function() {
	      resolve(urls);
	    };
	
	    transaction.onabort = reject;
	  });
	}
	
	function expireExtraEntries(db, maxEntries) {
	  // Bail out early by resolving with an empty array if we're not using
	  // maxEntries.
	  if (!maxEntries) {
	    return Promise.resolve([]);
	  }
	
	  return new Promise(function(resolve, reject) {
	    var urls = [];
	
	    var transaction = db.transaction(STORE_NAME, 'readwrite');
	    var objectStore = transaction.objectStore(STORE_NAME);
	    var index = objectStore.index(TIMESTAMP_PROPERTY);
	
	    var countRequest = index.count();
	    index.count().onsuccess = function() {
	      var initialCount = countRequest.result;
	
	      if (initialCount > maxEntries) {
	        index.openCursor().onsuccess = function(cursorEvent) {
	          var cursor = cursorEvent.target.result;
	          if (cursor) {
	            var url = cursor.value[URL_PROPERTY];
	            urls.push(url);
	            objectStore.delete(url);
	            if (initialCount - urls.length > maxEntries) {
	              cursor.continue();
	            }
	          }
	        };
	      }
	    };
	
	    transaction.oncomplete = function() {
	      resolve(urls);
	    };
	
	    transaction.onabort = reject;
	  });
	}
	
	function expireEntries(db, maxEntries, maxAgeSeconds, now) {
	  return expireOldEntries(db, maxAgeSeconds, now).then(function(oldUrls) {
	    return expireExtraEntries(db, maxEntries).then(function(extraUrls) {
	      return oldUrls.concat(extraUrls);
	    });
	  });
	}
	
	module.exports = {
	  getDb: getDb,
	  setTimestampForUrl: setTimestampForUrl,
	  expireEntries: expireEntries
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*
		Copyright 2014 Google Inc. All Rights Reserved.
	
		Licensed under the Apache License, Version 2.0 (the "License");
		you may not use this file except in compliance with the License.
		You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
		Unless required by applicable law or agreed to in writing, software
		distributed under the License is distributed on an "AS IS" BASIS,
		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		See the License for the specific language governing permissions and
		limitations under the License.
	*/
	module.exports = {
	  networkOnly: __webpack_require__(11),
	  networkFirst: __webpack_require__(12),
	  cacheOnly: __webpack_require__(13),
	  cacheFirst: __webpack_require__(14),
	  fastest: __webpack_require__(15)
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
		Copyright 2014 Google Inc. All Rights Reserved.
	
		Licensed under the Apache License, Version 2.0 (the "License");
		you may not use this file except in compliance with the License.
		You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
		Unless required by applicable law or agreed to in writing, software
		distributed under the License is distributed on an "AS IS" BASIS,
		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		See the License for the specific language governing permissions and
		limitations under the License.
	*/
	'use strict';
	var helpers = __webpack_require__(8);
	
	function networkOnly(request, values, options) {
	  helpers.debug('Strategy: network only [' + request.url + ']', options);
	  return fetch(request);
	}
	
	module.exports = networkOnly;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 Copyright 2015 Google Inc. All Rights Reserved.
	
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at
	
	     http://www.apache.org/licenses/LICENSE-2.0
	
	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.
	*/
	'use strict';
	var globalOptions = __webpack_require__(3);
	var helpers = __webpack_require__(8);
	
	function networkFirst(request, values, options) {
	  options = options || {};
	  var successResponses = options.successResponses ||
	      globalOptions.successResponses;
	  // This will bypass options.networkTimeout if it's set to a false-y value like
	  // 0, but that's the sane thing to do anyway.
	  var networkTimeoutSeconds = options.networkTimeoutSeconds ||
	      globalOptions.networkTimeoutSeconds;
	  helpers.debug('Strategy: network first [' + request.url + ']', options);
	
	  return helpers.openCache(options).then(function(cache) {
	    var timeoutId;
	    var promises = [];
	    var originalResponse;
	
	    if (networkTimeoutSeconds) {
	      var cacheWhenTimedOutPromise = new Promise(function(resolve) {
	        timeoutId = setTimeout(function() {
	          cache.match(request).then(function(response) {
	            if (response) {
	              // Only resolve this promise if there's a valid response in the
	              // cache. This ensures that we won't time out a network request
	              // unless there's a cached entry to fallback on, which is arguably
	              // the preferable behavior.
	              resolve(response);
	            }
	          });
	        }, networkTimeoutSeconds * 1000);
	      });
	      promises.push(cacheWhenTimedOutPromise);
	    }
	
	    var networkPromise = helpers.fetchAndCache(request, options)
	      .then(function(response) {
	        // We've got a response, so clear the network timeout if there is one.
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	
	        if (successResponses.test(response.status)) {
	          return response;
	        }
	
	        helpers.debug('Response was an HTTP error: ' + response.statusText,
	            options);
	        originalResponse = response;
	        throw new Error('Bad response');
	      }).catch(function() {
	        helpers.debug('Network or response error, fallback to cache [' +
	            request.url + ']', options);
	        return cache.match(request).then(function(response) {
	          return response || originalResponse;
	        });
	      });
	
	    promises.push(networkPromise);
	
	    return Promise.race(promises);
	  });
	}
	
	module.exports = networkFirst;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
		Copyright 2014 Google Inc. All Rights Reserved.
	
		Licensed under the Apache License, Version 2.0 (the "License");
		you may not use this file except in compliance with the License.
		You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
		Unless required by applicable law or agreed to in writing, software
		distributed under the License is distributed on an "AS IS" BASIS,
		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		See the License for the specific language governing permissions and
		limitations under the License.
	*/
	'use strict';
	var helpers = __webpack_require__(8);
	
	function cacheOnly(request, values, options) {
	  helpers.debug('Strategy: cache only [' + request.url + ']', options);
	  return helpers.openCache(options).then(function(cache) {
	    return cache.match(request);
	  });
	}
	
	module.exports = cacheOnly;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*
		Copyright 2014 Google Inc. All Rights Reserved.
	
		Licensed under the Apache License, Version 2.0 (the "License");
		you may not use this file except in compliance with the License.
		You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
		Unless required by applicable law or agreed to in writing, software
		distributed under the License is distributed on an "AS IS" BASIS,
		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		See the License for the specific language governing permissions and
		limitations under the License.
	*/
	'use strict';
	var helpers = __webpack_require__(8);
	
	function cacheFirst(request, values, options) {
	  helpers.debug('Strategy: cache first [' + request.url + ']', options);
	  return helpers.openCache(options).then(function(cache) {
	    return cache.match(request).then(function(response) {
	      if (response) {
	        return response;
	      }
	
	      return helpers.fetchAndCache(request, options);
	    });
	  });
	}
	
	module.exports = cacheFirst;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Copyright 2014 Google Inc. All Rights Reserved.
	
	  Licensed under the Apache License, Version 2.0 (the "License");
	  you may not use this file except in compliance with the License.
	  You may obtain a copy of the License at
	
	      http://www.apache.org/licenses/LICENSE-2.0
	
	  Unless required by applicable law or agreed to in writing, software
	  distributed under the License is distributed on an "AS IS" BASIS,
	  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	  See the License for the specific language governing permissions and
	  limitations under the License.
	*/
	'use strict';
	var helpers = __webpack_require__(8);
	var cacheOnly = __webpack_require__(13);
	
	function fastest(request, values, options) {
	  helpers.debug('Strategy: fastest [' + request.url + ']', options);
	
	  return new Promise(function(resolve, reject) {
	    var rejected = false;
	    var reasons = [];
	
	    var maybeReject = function(reason) {
	      reasons.push(reason.toString());
	      if (rejected) {
	        reject(new Error('Both cache and network failed: "' +
	            reasons.join('", "') + '"'));
	      } else {
	        rejected = true;
	      }
	    };
	
	    var maybeResolve = function(result) {
	      if (result instanceof Response) {
	        resolve(result);
	      } else {
	        maybeReject('No result returned');
	      }
	    };
	
	    helpers.fetchAndCache(request.clone(), options)
	      .then(maybeResolve, maybeReject);
	
	    cacheOnly(request, values, options)
	      .then(maybeResolve, maybeReject);
	  });
	}
	
	module.exports = fastest;


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2JkMjI0ODJiMWJkMTk2Yzk1MWMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VpL3B3ZC9zdy5qcyIsIndlYnBhY2s6Ly8vLi9+L3N3LXRvb2xib3gvbGliL3N3LXRvb2xib3guanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L34vc2VydmljZXdvcmtlci1jYWNoZS1wb2x5ZmlsbC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3N3LXRvb2xib3gvbGliL29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9yb3V0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9yb3V0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L3N3LXRvb2xib3gvfi9wYXRoLXRvLXJlZ2V4cC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3N3LXRvb2xib3gvfi9wYXRoLXRvLXJlZ2V4cC9+L2lzYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9oZWxwZXJzLmpzIiwid2VicGFjazovLy8uL34vc3ctdG9vbGJveC9saWIvaWRiLWNhY2hlLWV4cGlyYXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9zdHJhdGVnaWVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vc3ctdG9vbGJveC9saWIvc3RyYXRlZ2llcy9uZXR3b3JrT25seS5qcyIsIndlYnBhY2s6Ly8vLi9+L3N3LXRvb2xib3gvbGliL3N0cmF0ZWdpZXMvbmV0d29ya0ZpcnN0LmpzIiwid2VicGFjazovLy8uL34vc3ctdG9vbGJveC9saWIvc3RyYXRlZ2llcy9jYWNoZU9ubHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9zdHJhdGVnaWVzL2NhY2hlRmlyc3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zdy10b29sYm94L2xpYi9zdHJhdGVnaWVzL2Zhc3Rlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O0FDbENBOztBQUVBOzs7Ozs7QUFFQSxLQUFNLFdBQVcsc1JBQVcsRUFBNUI7O0FBRUEsS0FBSSxTQUFTLFFBQWIsRUFBdUI7QUFBQSxPQUNkLE1BRGMsR0FDSixTQUFTLFFBREwsQ0FDZCxNQURjOztBQUVyQix1QkFBUSxNQUFSLENBQWUsR0FBZixDQUFtQixHQUFuQixFQUF3QixvQkFBUSxNQUFSLENBQXhCO0FBQ0EsdUJBQVEsTUFBUixDQUFlLEdBQWYsQ0FBbUIsWUFBbkIsRUFBaUMsb0JBQVEsTUFBUixDQUFqQztBQUNEOztBQUVELEtBQUksU0FBUyxhQUFiLEVBQTRCO0FBQUEsT0FDbkIsT0FEbUIsR0FDVCxTQUFTLGFBREEsQ0FDbkIsTUFEbUI7O0FBRTFCLHVCQUFRLE1BQVIsQ0FBZSxHQUFmLENBQW1CLGtCQUFuQixFQUF1QyxvQkFBUSxPQUFSLENBQXZDO0FBQ0EsdUJBQVEsTUFBUixDQUFlLEdBQWYsQ0FBbUIsZUFBbkIsRUFBb0Msb0JBQVEsT0FBUixDQUFwQztBQUNBLHVCQUFRLE1BQVIsQ0FBZSxHQUFmLENBQW1CLG9CQUFuQixFQUF5QyxvQkFBUSxPQUFSLENBQXpDO0FBQ0EsdUJBQVEsTUFBUixDQUFlLEdBQWYsQ0FBbUIsZ0JBQW5CLEVBQXFDLG9CQUFRLE9BQVIsQ0FBckM7QUFDRDs7QUFFRCxxQkFBUSxNQUFSLENBQWUsT0FBZixHQUF5QixvQkFBUSxPQUFqQztBQUNBLEtBQUksU0FBUyxLQUFiLEVBQW9CO0FBQ2xCLHVCQUFRLE9BQVIsQ0FBZ0IsS0FBaEIsR0FBd0IsSUFBeEI7QUFDRCxFOzs7Ozs7QUMzQkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixRQUFRLHFCQUFxQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0EsRUFBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxFQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWlDO0FBQ2pDO0FBQ0EsUUFBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFVBQVM7QUFDVDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxNQUFLO0FBQ0w7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBQyxJOzs7Ozs7QUN0R0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3ZDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLHlDQUF3QztBQUN4Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN0SEE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7O0FBRUE7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTCxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzdKQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3JCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDdkJBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWCxVQUFTO0FBQ1QsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVCxRQUFPOztBQUVQOztBQUVBO0FBQ0EsSUFBRztBQUNIOztBQUVBOzs7Ozs7O0FDaEZBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7QUN6QkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7QUFDTCxJQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7QUMvQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBIiwiZmlsZSI6IjNiZDIyNDgyYjFiZDE5NmM5NTFjLnNlcnZpY2V3b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDNiZDIyNDgyYjFiZDE5NmM5NTFjXG4gKiovIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHR1c2hhci5tYXRodXIgb24gMjQvMDQvMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCB0b29sYm94IGZyb20gJ3N3LXRvb2xib3gnXG5cbmNvbnN0IHN3Q29uZmlnID0gQVBQX0NPTkZJRy5zd1xuXG5pZiAoc3dDb25maWcuYXBwQ2FjaGUpIHtcbiAgY29uc3Qge3BvbGljeX0gPSBzd0NvbmZpZy5hcHBDYWNoZVxuICB0b29sYm94LnJvdXRlci5nZXQoJy8nLCB0b29sYm94W3BvbGljeV0pXG4gIHRvb2xib3gucm91dGVyLmdldCgvLipidW5kbGUuKi8sIHRvb2xib3hbcG9saWN5XSlcbn1cblxuaWYgKHN3Q29uZmlnLmV4dGVybmFsQ2FjaGUpIHtcbiAgY29uc3Qge3BvbGljeX0gPSBzd0NvbmZpZy5leHRlcm5hbENhY2hlXG4gIHRvb2xib3gucm91dGVyLmdldCgvXi4qZ29vZ2xlYXBpcy4qJC8sIHRvb2xib3hbcG9saWN5XSlcbiAgdG9vbGJveC5yb3V0ZXIuZ2V0KC9eLipnc3RhdGljLiokLywgdG9vbGJveFtwb2xpY3ldKVxuICB0b29sYm94LnJvdXRlci5nZXQoL14uKmJvb3RzdHJhcGNkbi4qJC8sIHRvb2xib3hbcG9saWN5XSlcbiAgdG9vbGJveC5yb3V0ZXIuZ2V0KC9eLipzbmRcXC5jZG4uKiQvLCB0b29sYm94W3BvbGljeV0pXG59XG5cbnRvb2xib3gucm91dGVyLmRlZmF1bHQgPSB0b29sYm94LmZhc3Rlc3RcbmlmIChzd0NvbmZpZy5kZWJ1Zykge1xuICB0b29sYm94Lm9wdGlvbnMuZGVidWcgPSB0cnVlXG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91aS9wd2Qvc3cuanNcbiAqKi8iLCIvKlxuICBDb3B5cmlnaHQgMjAxNCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJ3NlcnZpY2V3b3JrZXItY2FjaGUtcG9seWZpbGwnKTtcbnZhciBvcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG52YXIgcm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXInKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgc3RyYXRlZ2llcyA9IHJlcXVpcmUoJy4vc3RyYXRlZ2llcycpO1xuXG5oZWxwZXJzLmRlYnVnKCdTZXJ2aWNlIFdvcmtlciBUb29sYm94IGlzIGxvYWRpbmcnKTtcblxuLy8gSW5zdGFsbFxuXG52YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gIHJldHVybiBpdGVtcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgfSwgW10pO1xufTtcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIGluYWN0aXZlQ2FjaGUgPSBvcHRpb25zLmNhY2hlLm5hbWUgKyAnJCQkaW5hY3RpdmUkJCQnO1xuICBoZWxwZXJzLmRlYnVnKCdpbnN0YWxsIGV2ZW50IGZpcmVkJyk7XG4gIGhlbHBlcnMuZGVidWcoJ2NyZWF0aW5nIGNhY2hlIFsnICsgaW5hY3RpdmVDYWNoZSArICddJyk7XG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBoZWxwZXJzLm9wZW5DYWNoZSh7Y2FjaGU6IHtuYW1lOiBpbmFjdGl2ZUNhY2hlfX0pLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChvcHRpb25zLnByZUNhY2hlSXRlbXMpXG4gICAgICAgIC50aGVuKGZsYXR0ZW4pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByZUNhY2hlSXRlbXMpIHtcbiAgICAgICAgICBoZWxwZXJzLmRlYnVnKCdwcmVDYWNoZSBsaXN0OiAnICtcbiAgICAgICAgICAgICAgKHByZUNhY2hlSXRlbXMuam9pbignLCAnKSB8fCAnKG5vbmUpJykpO1xuICAgICAgICAgIHJldHVybiBjYWNoZS5hZGRBbGwocHJlQ2FjaGVJdGVtcyk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICk7XG59KTtcblxuLy8gQWN0aXZhdGVcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdhY3RpdmF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGhlbHBlcnMuZGVidWcoJ2FjdGl2YXRlIGV2ZW50IGZpcmVkJyk7XG4gIHZhciBpbmFjdGl2ZUNhY2hlID0gb3B0aW9ucy5jYWNoZS5uYW1lICsgJyQkJGluYWN0aXZlJCQkJztcbiAgZXZlbnQud2FpdFVudGlsKGhlbHBlcnMucmVuYW1lQ2FjaGUoaW5hY3RpdmVDYWNoZSwgb3B0aW9ucy5jYWNoZS5uYW1lKSk7XG59KTtcblxuLy8gRmV0Y2hcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBoYW5kbGVyID0gcm91dGVyLm1hdGNoKGV2ZW50LnJlcXVlc3QpO1xuXG4gIGlmIChoYW5kbGVyKSB7XG4gICAgZXZlbnQucmVzcG9uZFdpdGgoaGFuZGxlcihldmVudC5yZXF1ZXN0KSk7XG4gIH0gZWxzZSBpZiAocm91dGVyLmRlZmF1bHQgJiYgZXZlbnQucmVxdWVzdC5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgZXZlbnQucmVzcG9uZFdpdGgocm91dGVyLmRlZmF1bHQoZXZlbnQucmVxdWVzdCkpO1xuICB9XG59KTtcblxuLy8gQ2FjaGluZ1xuXG5mdW5jdGlvbiBjYWNoZSh1cmwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGhlbHBlcnMub3BlbkNhY2hlKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICByZXR1cm4gY2FjaGUuYWRkKHVybCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1bmNhY2hlKHVybCwgb3B0aW9ucykge1xuICByZXR1cm4gaGVscGVycy5vcGVuQ2FjaGUob3B0aW9ucykudGhlbihmdW5jdGlvbihjYWNoZSkge1xuICAgIHJldHVybiBjYWNoZS5kZWxldGUodXJsKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHByZWNhY2hlKGl0ZW1zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShpdGVtcykpIHtcbiAgICBpdGVtcyA9IFtpdGVtc107XG4gIH1cbiAgb3B0aW9ucy5wcmVDYWNoZUl0ZW1zID0gb3B0aW9ucy5wcmVDYWNoZUl0ZW1zLmNvbmNhdChpdGVtcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuZXR3b3JrT25seTogc3RyYXRlZ2llcy5uZXR3b3JrT25seSxcbiAgbmV0d29ya0ZpcnN0OiBzdHJhdGVnaWVzLm5ldHdvcmtGaXJzdCxcbiAgY2FjaGVPbmx5OiBzdHJhdGVnaWVzLmNhY2hlT25seSxcbiAgY2FjaGVGaXJzdDogc3RyYXRlZ2llcy5jYWNoZUZpcnN0LFxuICBmYXN0ZXN0OiBzdHJhdGVnaWVzLmZhc3Rlc3QsXG4gIHJvdXRlcjogcm91dGVyLFxuICBvcHRpb25zOiBvcHRpb25zLFxuICBjYWNoZTogY2FjaGUsXG4gIHVuY2FjaGU6IHVuY2FjaGUsXG4gIHByZWNhY2hlOiBwcmVjYWNoZVxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL3N3LXRvb2xib3guanNcbiAqKiBtb2R1bGUgaWQgPSAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBuYXRpdmVBZGRBbGwgPSBDYWNoZS5wcm90b3R5cGUuYWRkQWxsO1xuICB2YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKEZpcmVmb3h8Q2hyb21lKVxcLyhcXGQrXFwuKS8pO1xuXG4gIC8vIEhhcyBuaWNlIGJlaGF2aW9yIG9mIGB2YXJgIHdoaWNoIGV2ZXJ5b25lIGhhdGVzXG4gIGlmICh1c2VyQWdlbnQpIHtcbiAgICB2YXIgYWdlbnQgPSB1c2VyQWdlbnRbMV07XG4gICAgdmFyIHZlcnNpb24gPSBwYXJzZUludCh1c2VyQWdlbnRbMl0pO1xuICB9XG5cbiAgaWYgKFxuICAgIG5hdGl2ZUFkZEFsbCAmJiAoIXVzZXJBZ2VudCB8fFxuICAgICAgKGFnZW50ID09PSAnRmlyZWZveCcgJiYgdmVyc2lvbiA+PSA0NikgfHxcbiAgICAgIChhZ2VudCA9PT0gJ0Nocm9tZScgICYmIHZlcnNpb24gPj0gNTApXG4gICAgKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBDYWNoZS5wcm90b3R5cGUuYWRkQWxsID0gZnVuY3Rpb24gYWRkQWxsKHJlcXVlc3RzKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcztcblxuICAgIC8vIFNpbmNlIERPTUV4Y2VwdGlvbnMgYXJlIG5vdCBjb25zdHJ1Y3RhYmxlOlxuICAgIGZ1bmN0aW9uIE5ldHdvcmtFcnJvcihtZXNzYWdlKSB7XG4gICAgICB0aGlzLm5hbWUgPSAnTmV0d29ya0Vycm9yJztcbiAgICAgIHRoaXMuY29kZSA9IDE5O1xuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG5cbiAgICBOZXR3b3JrRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblxuICAgICAgLy8gU2ltdWxhdGUgc2VxdWVuY2U8KFJlcXVlc3Qgb3IgVVNWU3RyaW5nKT4gYmluZGluZzpcbiAgICAgIHZhciBzZXF1ZW5jZSA9IFtdO1xuXG4gICAgICByZXF1ZXN0cyA9IHJlcXVlc3RzLm1hcChmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgICAgIGlmIChyZXF1ZXN0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBTdHJpbmcocmVxdWVzdCk7IC8vIG1heSB0aHJvdyBUeXBlRXJyb3JcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgcmVxdWVzdHMubWFwKGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QocmVxdWVzdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHNjaGVtZSA9IG5ldyBVUkwocmVxdWVzdC51cmwpLnByb3RvY29sO1xuXG4gICAgICAgICAgaWYgKHNjaGVtZSAhPT0gJ2h0dHA6JyAmJiBzY2hlbWUgIT09ICdodHRwczonKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTmV0d29ya0Vycm9yKFwiSW52YWxpZCBzY2hlbWVcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGZldGNoKHJlcXVlc3QuY2xvbmUoKSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2VzKSB7XG4gICAgICAvLyBJZiBzb21lIG9mIHRoZSByZXNwb25zZXMgaGFzIG5vdCBPSy1laXNoIHN0YXR1cyxcbiAgICAgIC8vIHRoZW4gd2hvbGUgb3BlcmF0aW9uIHNob3VsZCByZWplY3RcbiAgICAgIGlmIChyZXNwb25zZXMuc29tZShmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gIXJlc3BvbnNlLm9rO1xuICAgICAgfSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE5ldHdvcmtFcnJvcignSW5jb3JyZWN0IHJlc3BvbnNlIHN0YXR1cycpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBjaGVjayB0aGF0IHJlcXVlc3RzIGRvbid0IG92ZXJ3cml0ZSBvbmUgYW5vdGhlclxuICAgICAgLy8gKGRvbid0IHRoaW5rIHRoaXMgaXMgcG9zc2libGUgdG8gcG9seWZpbGwgZHVlIHRvIG9wYXF1ZSByZXNwb25zZXMpXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIHJlc3BvbnNlcy5tYXAoZnVuY3Rpb24ocmVzcG9uc2UsIGkpIHtcbiAgICAgICAgICByZXR1cm4gY2FjaGUucHV0KHJlcXVlc3RzW2ldLCByZXNwb25zZSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pO1xuICB9O1xuXG4gIENhY2hlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQocmVxdWVzdCkge1xuICAgIHJldHVybiB0aGlzLmFkZEFsbChbcmVxdWVzdF0pO1xuICB9O1xufSgpKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L34vc2VydmljZXdvcmtlci1jYWNoZS1wb2x5ZmlsbC9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qXG5cdENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cblx0TGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcblx0eW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuXHRZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblx0VW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuXHRkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5cdFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuXHRTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5cdGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETzogVGhpcyBpcyBuZWNlc3NhcnkgdG8gaGFuZGxlIGRpZmZlcmVudCBpbXBsZW1lbnRhdGlvbnMgaW4gdGhlIHdpbGRcbi8vIFRoZSBzcGVjIGRlZmluZXMgc2VsZi5yZWdpc3RyYXRpb24sIGJ1dCBpdCB3YXMgbm90IGltcGxlbWVudGVkIGluIENocm9tZSA0MC5cbnZhciBzY29wZTtcbmlmIChzZWxmLnJlZ2lzdHJhdGlvbikge1xuICBzY29wZSA9IHNlbGYucmVnaXN0cmF0aW9uLnNjb3BlO1xufSBlbHNlIHtcbiAgc2NvcGUgPSBzZWxmLnNjb3BlIHx8IG5ldyBVUkwoJy4vJywgc2VsZi5sb2NhdGlvbikuaHJlZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhY2hlOiB7XG4gICAgbmFtZTogJyQkJHRvb2xib3gtY2FjaGUkJCQnICsgc2NvcGUgKyAnJCQkJyxcbiAgICBtYXhBZ2VTZWNvbmRzOiBudWxsLFxuICAgIG1heEVudHJpZXM6IG51bGxcbiAgfSxcbiAgZGVidWc6IGZhbHNlLFxuICBuZXR3b3JrVGltZW91dFNlY29uZHM6IG51bGwsXG4gIHByZUNhY2hlSXRlbXM6IFtdLFxuICAvLyBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhcHBseSB0byBIVFRQIHJlc3BvbnNlIGNvZGVzLiBDb2RlcyB0aGF0IG1hdGNoXG4gIC8vIHdpbGwgYmUgY29uc2lkZXJlZCBzdWNjZXNzZXMsIHdoaWxlIG90aGVycyB3aWxsIG5vdCwgYW5kIHdpbGwgbm90IGJlXG4gIC8vIGNhY2hlZC5cbiAgc3VjY2Vzc1Jlc3BvbnNlczogL14wfChbMTIzXVxcZFxcZCl8KDQwWzE0NTY3XSl8NDEwJC9cbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L2xpYi9vcHRpb25zLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcbiAgQ29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUm91dGUgPSByZXF1aXJlKCcuL3JvdXRlJyk7XG5cbmZ1bmN0aW9uIHJlZ2V4RXNjYXBlKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJyk7XG59XG5cbnZhciBrZXlNYXRjaCA9IGZ1bmN0aW9uKG1hcCwgc3RyaW5nKSB7XG4gIC8vIFRoaXMgd291bGQgYmUgYmV0dGVyIHdyaXR0ZW4gYXMgYSBmb3IuLm9mIGxvb3AsIGJ1dCB0aGF0IHdvdWxkIGJyZWFrIHRoZVxuICAvLyBtaW5pZnlpZnkgcHJvY2VzcyBpbiB0aGUgYnVpbGQuXG4gIHZhciBlbnRyaWVzSXRlcmF0b3IgPSBtYXAuZW50cmllcygpO1xuICB2YXIgaXRlbSA9IGVudHJpZXNJdGVyYXRvci5uZXh0KCk7XG4gIHdoaWxlICghaXRlbS5kb25lKSB7XG4gICAgdmFyIHBhdHRlcm4gPSBuZXcgUmVnRXhwKGl0ZW0udmFsdWVbMF0pO1xuICAgIGlmIChwYXR0ZXJuLnRlc3Qoc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIGl0ZW0udmFsdWVbMV07XG4gICAgfVxuICAgIGl0ZW0gPSBlbnRyaWVzSXRlcmF0b3IubmV4dCgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxudmFyIFJvdXRlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdXRlcyA9IG5ldyBNYXAoKTtcbiAgdGhpcy5kZWZhdWx0ID0gbnVsbDtcbn07XG5cblsnZ2V0JywgJ3Bvc3QnLCAncHV0JywgJ2RlbGV0ZScsICdoZWFkJywgJ2FueSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gIFJvdXRlci5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHBhdGgsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGQobWV0aG9kLCBwYXRoLCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgfTtcbn0pO1xuXG5Sb3V0ZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgaGFuZGxlciwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIG9yaWdpbjtcblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIC8vIFdlIG5lZWQgYSB1bmlxdWUga2V5IHRvIHVzZSBpbiB0aGUgTWFwIHRvIGRpc3Rpbmd1aXNoIFJlZ0V4cCBwYXRoc1xuICAgIC8vIGZyb20gRXhwcmVzcy1zdHlsZSBwYXRocyArIG9yaWdpbnMuIFNpbmNlIHdlIGNhbiB1c2UgYW55IG9iamVjdCBhcyB0aGVcbiAgICAvLyBrZXkgaW4gYSBNYXAsIGxldCdzIHVzZSB0aGUgUmVnRXhwIGNvbnN0cnVjdG9yIVxuICAgIG9yaWdpbiA9IFJlZ0V4cDtcbiAgfSBlbHNlIHtcbiAgICBvcmlnaW4gPSBvcHRpb25zLm9yaWdpbiB8fCBzZWxmLmxvY2F0aW9uLm9yaWdpbjtcbiAgICBpZiAob3JpZ2luIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBvcmlnaW4gPSBvcmlnaW4uc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcmlnaW4gPSByZWdleEVzY2FwZShvcmlnaW4pO1xuICAgIH1cbiAgfVxuXG4gIG1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gIHZhciByb3V0ZSA9IG5ldyBSb3V0ZShtZXRob2QsIHBhdGgsIGhhbmRsZXIsIG9wdGlvbnMpO1xuXG4gIGlmICghdGhpcy5yb3V0ZXMuaGFzKG9yaWdpbikpIHtcbiAgICB0aGlzLnJvdXRlcy5zZXQob3JpZ2luLCBuZXcgTWFwKCkpO1xuICB9XG5cbiAgdmFyIG1ldGhvZE1hcCA9IHRoaXMucm91dGVzLmdldChvcmlnaW4pO1xuICBpZiAoIW1ldGhvZE1hcC5oYXMobWV0aG9kKSkge1xuICAgIG1ldGhvZE1hcC5zZXQobWV0aG9kLCBuZXcgTWFwKCkpO1xuICB9XG5cbiAgdmFyIHJvdXRlTWFwID0gbWV0aG9kTWFwLmdldChtZXRob2QpO1xuICB2YXIgcmVnRXhwID0gcm91dGUucmVnZXhwIHx8IHJvdXRlLmZ1bGxVcmxSZWdFeHA7XG4gIHJvdXRlTWFwLnNldChyZWdFeHAuc291cmNlLCByb3V0ZSk7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm1hdGNoTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kLCB1cmwpIHtcbiAgdmFyIHVybE9iamVjdCA9IG5ldyBVUkwodXJsKTtcbiAgdmFyIG9yaWdpbiA9IHVybE9iamVjdC5vcmlnaW47XG4gIHZhciBwYXRoID0gdXJsT2JqZWN0LnBhdGhuYW1lO1xuXG4gIC8vIFdlIHdhbnQgdG8gZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZXJlJ3MgYSBtYXRjaCBhZ2FpbnN0IGFueVxuICAvLyBcIkV4cHJlc3Mtc3R5bGVcIiByb3V0ZXMgKHN0cmluZyBmb3IgdGhlIHBhdGgsIFJlZ0V4cCBmb3IgdGhlIG9yaWdpbikuXG4gIC8vIENoZWNraW5nIGZvciBFeHByZXNzLXN0eWxlIG1hdGNoZXMgZmlyc3QgbWFpbnRhaW5zIHRoZSBsZWdhY3kgYmVoYXZpb3IuXG4gIC8vIElmIHRoZXJlJ3Mgbm8gbWF0Y2gsIHdlIG5leHQgY2hlY2sgZm9yIGEgbWF0Y2ggYWdhaW5zdCBhbnkgUmVnRXhwIHJvdXRlcyxcbiAgLy8gd2hlcmUgdGhlIFJlZ0V4cCBpbiBxdWVzdGlvbiBtYXRjaGVzIHRoZSBmdWxsIFVSTCAoYm90aCBvcmlnaW4gYW5kIHBhdGgpLlxuICByZXR1cm4gdGhpcy5fbWF0Y2gobWV0aG9kLCBrZXlNYXRjaCh0aGlzLnJvdXRlcywgb3JpZ2luKSwgcGF0aCkgfHxcbiAgICB0aGlzLl9tYXRjaChtZXRob2QsIHRoaXMucm91dGVzLmdldChSZWdFeHApLCB1cmwpO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5fbWF0Y2ggPSBmdW5jdGlvbihtZXRob2QsIG1ldGhvZE1hcCwgcGF0aE9yVXJsKSB7XG4gIGlmIChtZXRob2RNYXApIHtcbiAgICB2YXIgcm91dGVNYXAgPSBtZXRob2RNYXAuZ2V0KG1ldGhvZC50b0xvd2VyQ2FzZSgpKTtcbiAgICBpZiAocm91dGVNYXApIHtcbiAgICAgIHZhciByb3V0ZSA9IGtleU1hdGNoKHJvdXRlTWFwLCBwYXRoT3JVcmwpO1xuICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgIHJldHVybiByb3V0ZS5tYWtlSGFuZGxlcihwYXRoT3JVcmwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgcmV0dXJuIHRoaXMubWF0Y2hNZXRob2QocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsKSB8fFxuICAgICAgdGhpcy5tYXRjaE1ldGhvZCgnYW55JywgcmVxdWVzdC51cmwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUm91dGVyKCk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L2xpYi9yb3V0ZXIuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKlxuICBDb3B5cmlnaHQgMjAxNCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG4ndXNlIHN0cmljdCc7XG5cbi8vIFRPRE86IFVzZSBzZWxmLnJlZ2lzdHJhdGlvbi5zY29wZSBpbnN0ZWFkIG9mIHNlbGYubG9jYXRpb25cbnZhciB1cmwgPSBuZXcgVVJMKCcuLycsIHNlbGYubG9jYXRpb24pO1xudmFyIGJhc2VQYXRoID0gdXJsLnBhdGhuYW1lO1xudmFyIHBhdGhSZWdleHAgPSByZXF1aXJlKCdwYXRoLXRvLXJlZ2V4cCcpO1xuXG52YXIgUm91dGUgPSBmdW5jdGlvbihtZXRob2QsIHBhdGgsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgaWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICB0aGlzLmZ1bGxVcmxSZWdFeHAgPSBwYXRoO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSBVUkwoKSBjb25zdHJ1Y3RvciBjYW4ndCBwYXJzZSBleHByZXNzLXN0eWxlIHJvdXRlcyBhcyB0aGV5IGFyZSBub3RcbiAgICAvLyB2YWxpZCB1cmxzLiBUaGlzIG1lYW5zIHdlIGhhdmUgdG8gbWFudWFsbHkgbWFuaXB1bGF0ZSByZWxhdGl2ZSB1cmxzIGludG9cbiAgICAvLyBhYnNvbHV0ZSBvbmVzLiBUaGlzIGNoZWNrIGlzIGV4dHJlbWVseSBuYWl2ZSBidXQgaW1wbGVtZW50aW5nIGEgdHdlYWtlZFxuICAgIC8vIHZlcnNpb24gb2YgdGhlIGZ1bGwgYWxnb3JpdGhtIHNlZW1zIGxpa2Ugb3ZlcmtpbGxcbiAgICAvLyAoaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWJhc2ljLXVybC1wYXJzZXIpXG4gICAgaWYgKHBhdGguaW5kZXhPZignLycpICE9PSAwKSB7XG4gICAgICBwYXRoID0gYmFzZVBhdGggKyBwYXRoO1xuICAgIH1cblxuICAgIHRoaXMua2V5cyA9IFtdO1xuICAgIHRoaXMucmVnZXhwID0gcGF0aFJlZ2V4cChwYXRoLCB0aGlzLmtleXMpO1xuICB9XG5cbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG59O1xuXG5Sb3V0ZS5wcm90b3R5cGUubWFrZUhhbmRsZXIgPSBmdW5jdGlvbih1cmwpIHtcbiAgdmFyIHZhbHVlcztcbiAgaWYgKHRoaXMucmVnZXhwKSB7XG4gICAgdmFyIG1hdGNoID0gdGhpcy5yZWdleHAuZXhlYyh1cmwpO1xuICAgIHZhbHVlcyA9IHt9O1xuICAgIHRoaXMua2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgaW5kZXgpIHtcbiAgICAgIHZhbHVlc1trZXkubmFtZV0gPSBtYXRjaFtpbmRleCArIDFdO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyKHJlcXVlc3QsIHZhbHVlcywgdGhpcy5vcHRpb25zKTtcbiAgfS5iaW5kKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL3JvdXRlLmpzXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzYXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuLyoqXG4gKiBFeHBvc2UgYHBhdGhUb1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aFRvUmVnZXhwXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5tb2R1bGUuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZVxubW9kdWxlLmV4cG9ydHMudG9rZW5zVG9GdW5jdGlvbiA9IHRva2Vuc1RvRnVuY3Rpb25cbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvUmVnRXhwID0gdG9rZW5zVG9SZWdFeHBcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiLCB1bmRlZmluZWRdXG4gIC8vIFwiL3JvdXRlKFxcXFxkKylcIiAgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgLy8gXCIvKlwiICAgICAgICAgICAgPT4gW1wiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiKlwiXVxuICAnKFtcXFxcLy5dKT8oPzooPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpP3xcXFxcKCgoPzpcXFxcXFxcXC58W14oKV0pKylcXFxcKSkoWysqP10pP3woXFxcXCopKSdcbl0uam9pbignfCcpLCAnZycpXG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgZm9yIHRoZSByYXcgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICB2YXIgdG9rZW5zID0gW11cbiAgdmFyIGtleSA9IDBcbiAgdmFyIGluZGV4ID0gMFxuICB2YXIgcGF0aCA9ICcnXG4gIHZhciByZXNcblxuICB3aGlsZSAoKHJlcyA9IFBBVEhfUkVHRVhQLmV4ZWMoc3RyKSkgIT0gbnVsbCkge1xuICAgIHZhciBtID0gcmVzWzBdXG4gICAgdmFyIGVzY2FwZWQgPSByZXNbMV1cbiAgICB2YXIgb2Zmc2V0ID0gcmVzLmluZGV4XG4gICAgcGF0aCArPSBzdHIuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICBpbmRleCA9IG9mZnNldCArIG0ubGVuZ3RoXG5cbiAgICAvLyBJZ25vcmUgYWxyZWFkeSBlc2NhcGVkIHNlcXVlbmNlcy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcGF0aCArPSBlc2NhcGVkWzFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIFB1c2ggdGhlIGN1cnJlbnQgcGF0aCBvbnRvIHRoZSB0b2tlbnMuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gICAgICBwYXRoID0gJydcbiAgICB9XG5cbiAgICB2YXIgcHJlZml4ID0gcmVzWzJdXG4gICAgdmFyIG5hbWUgPSByZXNbM11cbiAgICB2YXIgY2FwdHVyZSA9IHJlc1s0XVxuICAgIHZhciBncm91cCA9IHJlc1s1XVxuICAgIHZhciBzdWZmaXggPSByZXNbNl1cbiAgICB2YXIgYXN0ZXJpc2sgPSByZXNbN11cblxuICAgIHZhciByZXBlYXQgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBvcHRpb25hbCA9IHN1ZmZpeCA9PT0gJz8nIHx8IHN1ZmZpeCA9PT0gJyonXG4gICAgdmFyIGRlbGltaXRlciA9IHByZWZpeCB8fCAnLydcbiAgICB2YXIgcGF0dGVybiA9IGNhcHR1cmUgfHwgZ3JvdXAgfHwgKGFzdGVyaXNrID8gJy4qJyA6ICdbXicgKyBkZWxpbWl0ZXIgKyAnXSs/JylcblxuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUgfHwga2V5KyssXG4gICAgICBwcmVmaXg6IHByZWZpeCB8fCAnJyxcbiAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxuICAgICAgcmVwZWF0OiByZXBlYXQsXG4gICAgICBwYXR0ZXJuOiBlc2NhcGVHcm91cChwYXR0ZXJuKVxuICAgIH0pXG4gIH1cblxuICAvLyBNYXRjaCBhbnkgY2hhcmFjdGVycyBzdGlsbCByZW1haW5pbmcuXG4gIGlmIChpbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICBwYXRoICs9IHN0ci5zdWJzdHIoaW5kZXgpXG4gIH1cblxuICAvLyBJZiB0aGUgcGF0aCBleGlzdHMsIHB1c2ggaXQgb250byB0aGUgZW5kLlxuICBpZiAocGF0aCkge1xuICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogQ29tcGlsZSBhIHN0cmluZyB0byBhIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciB0aGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICAgc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY29tcGlsZSAoc3RyKSB7XG4gIHJldHVybiB0b2tlbnNUb0Z1bmN0aW9uKHBhcnNlKHN0cikpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgbWV0aG9kIGZvciB0cmFuc2Zvcm1pbmcgdG9rZW5zIGludG8gdGhlIHBhdGggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvRnVuY3Rpb24gKHRva2Vucykge1xuICAvLyBDb21waWxlIGFsbCB0aGUgdG9rZW5zIGludG8gcmVnZXhwcy5cbiAgdmFyIG1hdGNoZXMgPSBuZXcgQXJyYXkodG9rZW5zLmxlbmd0aClcblxuICAvLyBDb21waWxlIGFsbCB0aGUgcGF0dGVybnMgYmVmb3JlIGNvbXBpbGF0aW9uLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldID09PSAnb2JqZWN0Jykge1xuICAgICAgbWF0Y2hlc1tpXSA9IG5ldyBSZWdFeHAoJ14nICsgdG9rZW5zW2ldLnBhdHRlcm4gKyAnJCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcGF0aCA9ICcnXG4gICAgdmFyIGRhdGEgPSBvYmogfHwge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCArPSB0b2tlblxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSA9IGRhdGFbdG9rZW4ubmFtZV1cbiAgICAgIHZhciBzZWdtZW50XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBiZSBkZWZpbmVkJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNhcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCF0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCByZXBlYXQsIGJ1dCByZWNlaXZlZCBcIicgKyB2YWx1ZSArICdcIicpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pXG5cbiAgICAgICAgICBpZiAoIW1hdGNoZXNbaV0udGVzdChzZWdtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGggKz0gKGogPT09IDAgPyB0b2tlbi5wcmVmaXggOiB0b2tlbi5kZWxpbWl0ZXIpICsgc2VnbWVudFxuICAgICAgICB9XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc2VnbWVudCA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcblxuICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBtYXRjaCBcIicgKyB0b2tlbi5wYXR0ZXJuICsgJ1wiLCBidXQgcmVjZWl2ZWQgXCInICsgc2VnbWVudCArICdcIicpXG4gICAgICB9XG5cbiAgICAgIHBhdGggKz0gdG9rZW4ucHJlZml4ICsgc2VnbWVudFxuICAgIH1cblxuICAgIHJldHVybiBwYXRoXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBncm91cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHJlXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXNcbiAgcmV0dXJuIHJlXG59XG5cbi8qKlxuICogR2V0IHRoZSBmbGFncyBmb3IgYSByZWdleHAgZnJvbSB0aGUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZmxhZ3MgKG9wdGlvbnMpIHtcbiAgcmV0dXJuIG9wdGlvbnMuc2Vuc2l0aXZlID8gJycgOiAnaSdcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpXG5cbiAgaWYgKGdyb3Vwcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXlzLnB1c2goe1xuICAgICAgICBuYW1lOiBpLFxuICAgICAgICBwcmVmaXg6IG51bGwsXG4gICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgICAgICByZXBlYXQ6IGZhbHNlLFxuICAgICAgICBwYXR0ZXJuOiBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFycmF5IGludG8gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBhcnJheVRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciBwYXJ0cyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgcGFydHMucHVzaChwYXRoVG9SZWdleHAocGF0aFtpXSwga2V5cywgb3B0aW9ucykuc291cmNlKVxuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlZ2V4cCwga2V5cylcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwYXRoIHJlZ2V4cCBmcm9tIHN0cmluZyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSBwYXJzZShwYXRoKVxuICB2YXIgcmUgPSB0b2tlbnNUb1JlZ0V4cCh0b2tlbnMsIG9wdGlvbnMpXG5cbiAgLy8gQXR0YWNoIGtleXMgYmFjayB0byB0aGUgcmVnZXhwLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAga2V5cy5wdXNoKHRva2Vuc1tpXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZSwga2V5cylcbn1cblxuLyoqXG4gKiBFeHBvc2UgYSBmdW5jdGlvbiBmb3IgdGFraW5nIHRva2VucyBhbmQgcmV0dXJuaW5nIGEgUmVnRXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgdG9rZW5zXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiB0b2tlbnNUb1JlZ0V4cCAodG9rZW5zLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0XG4gIHZhciBlbmQgPSBvcHRpb25zLmVuZCAhPT0gZmFsc2VcbiAgdmFyIHJvdXRlID0gJydcbiAgdmFyIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSB0eXBlb2YgbGFzdFRva2VuID09PSAnc3RyaW5nJyAmJiAvXFwvJC8udGVzdChsYXN0VG9rZW4pXG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0b2tlbnMgYW5kIGNyZWF0ZSBvdXIgcmVnZXhwIHN0cmluZy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByb3V0ZSArPSBlc2NhcGVTdHJpbmcodG9rZW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwcmVmaXggPSBlc2NhcGVTdHJpbmcodG9rZW4ucHJlZml4KVxuICAgICAgdmFyIGNhcHR1cmUgPSB0b2tlbi5wYXR0ZXJuXG5cbiAgICAgIGlmICh0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgY2FwdHVyZSArPSAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonXG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoJyArIGNhcHR1cmUgKyAnKT8nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhcHR1cmUgPSBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyknXG4gICAgICB9XG5cbiAgICAgIHJvdXRlICs9IGNhcHR1cmVcbiAgICB9XG4gIH1cblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIG1hdGNoLiBJZiB0aGUgcGF0aCB0b1xuICAvLyBtYXRjaCBhbHJlYWR5IGVuZHMgd2l0aCBhIHNsYXNoLCB3ZSByZW1vdmUgaXQgZm9yIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2hcbiAgLy8gaXMgdmFsaWQgYXQgdGhlIGVuZCBvZiBhIHBhdGggbWF0Y2gsIG5vdCBpbiB0aGUgbWlkZGxlLiBUaGlzIGlzIGltcG9ydGFudFxuICAvLyBpbiBub24tZW5kaW5nIG1vZGUsIHdoZXJlIFwiL3Rlc3QvXCIgc2hvdWxkbid0IG1hdGNoIFwiL3Rlc3QvL3JvdXRlXCIuXG4gIGlmICghc3RyaWN0KSB7XG4gICAgcm91dGUgPSAoZW5kc1dpdGhTbGFzaCA/IHJvdXRlLnNsaWNlKDAsIC0yKSA6IHJvdXRlKSArICcoPzpcXFxcLyg/PSQpKT8nXG4gIH1cblxuICBpZiAoZW5kKSB7XG4gICAgcm91dGUgKz0gJyQnXG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gbm9uLWVuZGluZyBtb2RlLCB3ZSBuZWVkIHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2ggYXNcbiAgICAvLyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCB0byB0aGUgZW5kIG9yIG5leHQgcGF0aCBzZWdtZW50LlxuICAgIHJvdXRlICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknXG4gIH1cblxuICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByb3V0ZSwgZmxhZ3Mob3B0aW9ucykpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IGNhbiBiZSBwYXNzZWQgaW4gZm9yIHRoZSBrZXlzLCB3aGljaCB3aWxsIGhvbGQgdGhlXG4gKiBwbGFjZWhvbGRlciBrZXkgZGVzY3JpcHRpb25zLiBGb3IgZXhhbXBsZSwgdXNpbmcgYC91c2VyLzppZGAsIGBrZXlzYCB3aWxsXG4gKiBjb250YWluIGBbeyBuYW1lOiAnaWQnLCBkZWxpbWl0ZXI6ICcvJywgb3B0aW9uYWw6IGZhbHNlLCByZXBlYXQ6IGZhbHNlIH1dYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAgW2tleXNdXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgICAgICAgICAgIFtvcHRpb25zXVxuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBwYXRoVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAga2V5cyA9IGtleXMgfHwgW11cblxuICBpZiAoIWlzYXJyYXkoa2V5cykpIHtcbiAgICBvcHRpb25zID0ga2V5c1xuICAgIGtleXMgPSBbXVxuICB9IGVsc2UgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiByZWdleHBUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGlzYXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ1RvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG59XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L34vcGF0aC10by1yZWdleHAvaW5kZXguanNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L34vcGF0aC10by1yZWdleHAvfi9pc2FycmF5L2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcbiAgQ29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xvYmFsT3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpO1xudmFyIGlkYkNhY2hlRXhwaXJhdGlvbiA9IHJlcXVpcmUoJy4vaWRiLWNhY2hlLWV4cGlyYXRpb24nKTtcblxuZnVuY3Rpb24gZGVidWcobWVzc2FnZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGZsYWcgPSBvcHRpb25zLmRlYnVnIHx8IGdsb2JhbE9wdGlvbnMuZGVidWc7XG4gIGlmIChmbGFnKSB7XG4gICAgY29uc29sZS5sb2coJ1tzdy10b29sYm94XSAnICsgbWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb3BlbkNhY2hlKG9wdGlvbnMpIHtcbiAgdmFyIGNhY2hlTmFtZTtcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jYWNoZSkge1xuICAgIGNhY2hlTmFtZSA9IG9wdGlvbnMuY2FjaGUubmFtZTtcbiAgfVxuICBjYWNoZU5hbWUgPSBjYWNoZU5hbWUgfHwgZ2xvYmFsT3B0aW9ucy5jYWNoZS5uYW1lO1xuXG4gIHJldHVybiBjYWNoZXMub3BlbihjYWNoZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBmZXRjaEFuZENhY2hlKHJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzdWNjZXNzUmVzcG9uc2VzID0gb3B0aW9ucy5zdWNjZXNzUmVzcG9uc2VzIHx8XG4gICAgICBnbG9iYWxPcHRpb25zLnN1Y2Nlc3NSZXNwb25zZXM7XG5cbiAgcmV0dXJuIGZldGNoKHJlcXVlc3QuY2xvbmUoKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIC8vIE9ubHkgY2FjaGUgR0VUIHJlcXVlc3RzIHdpdGggc3VjY2Vzc2Z1bCByZXNwb25zZXMuXG4gICAgLy8gU2luY2UgdGhpcyBpcyBub3QgcGFydCBvZiB0aGUgcHJvbWlzZSBjaGFpbiwgaXQgd2lsbCBiZSBkb25lXG4gICAgLy8gYXN5bmNocm9ub3VzbHkgYW5kIHdpbGwgbm90IGJsb2NrIHRoZSByZXNwb25zZSBmcm9tIGJlaW5nIHJldHVybmVkIHRvIHRoZVxuICAgIC8vIHBhZ2UuXG4gICAgaWYgKHJlcXVlc3QubWV0aG9kID09PSAnR0VUJyAmJiBzdWNjZXNzUmVzcG9uc2VzLnRlc3QocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgICAgb3BlbkNhY2hlKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgICAgY2FjaGUucHV0KHJlcXVlc3QsIHJlc3BvbnNlKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIElmIGFueSBvZiB0aGUgb3B0aW9ucyBhcmUgcHJvdmlkZWQgaW4gb3B0aW9ucy5jYWNoZSB0aGVuIHVzZSB0aGVtLlxuICAgICAgICAgIC8vIERvIG5vdCBmYWxsYmFjayB0byB0aGUgZ2xvYmFsIG9wdGlvbnMgZm9yIGFueSB0aGF0IGFyZSBtaXNzaW5nXG4gICAgICAgICAgLy8gdW5sZXNzIHRoZXkgYXJlIGFsbCBtaXNzaW5nLlxuICAgICAgICAgIHZhciBjYWNoZU9wdGlvbnMgPSBvcHRpb25zLmNhY2hlIHx8IGdsb2JhbE9wdGlvbnMuY2FjaGU7XG5cbiAgICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY2FjaGUgZXhwaXJhdGlvbiBsb2dpYyBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlIG1heGltdW1zXG4gICAgICAgICAgLy8gaXMgc2V0LCBhbmQgaWYgd2UgaGF2ZSBhIG5hbWUgZm9yIHRoZSBjYWNoZSB0aGF0IHRoZSBvcHRpb25zIGFyZVxuICAgICAgICAgIC8vIGJlaW5nIGFwcGxpZWQgdG8uXG4gICAgICAgICAgaWYgKChjYWNoZU9wdGlvbnMubWF4RW50cmllcyB8fCBjYWNoZU9wdGlvbnMubWF4QWdlU2Vjb25kcykgJiZcbiAgICAgICAgICAgICAgY2FjaGVPcHRpb25zLm5hbWUpIHtcbiAgICAgICAgICAgIHF1ZXVlQ2FjaGVFeHBpcmF0aW9uKHJlcXVlc3QsIGNhY2hlLCBjYWNoZU9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2UuY2xvbmUoKTtcbiAgfSk7XG59XG5cbnZhciBjbGVhbnVwUXVldWU7XG5mdW5jdGlvbiBxdWV1ZUNhY2hlRXhwaXJhdGlvbihyZXF1ZXN0LCBjYWNoZSwgY2FjaGVPcHRpb25zKSB7XG4gIHZhciBjbGVhbnVwID0gY2xlYW51cENhY2hlLmJpbmQobnVsbCwgcmVxdWVzdCwgY2FjaGUsIGNhY2hlT3B0aW9ucyk7XG5cbiAgaWYgKGNsZWFudXBRdWV1ZSkge1xuICAgIGNsZWFudXBRdWV1ZSA9IGNsZWFudXBRdWV1ZS50aGVuKGNsZWFudXApO1xuICB9IGVsc2Uge1xuICAgIGNsZWFudXBRdWV1ZSA9IGNsZWFudXAoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhbnVwQ2FjaGUocmVxdWVzdCwgY2FjaGUsIGNhY2hlT3B0aW9ucykge1xuICB2YXIgcmVxdWVzdFVybCA9IHJlcXVlc3QudXJsO1xuICB2YXIgbWF4QWdlU2Vjb25kcyA9IGNhY2hlT3B0aW9ucy5tYXhBZ2VTZWNvbmRzO1xuICB2YXIgbWF4RW50cmllcyA9IGNhY2hlT3B0aW9ucy5tYXhFbnRyaWVzO1xuICB2YXIgY2FjaGVOYW1lID0gY2FjaGVPcHRpb25zLm5hbWU7XG5cbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gIGRlYnVnKCdVcGRhdGluZyBMUlUgb3JkZXIgZm9yICcgKyByZXF1ZXN0VXJsICsgJy4gTWF4IGVudHJpZXMgaXMgJyArXG4gICAgbWF4RW50cmllcyArICcsIG1heCBhZ2UgaXMgJyArIG1heEFnZVNlY29uZHMpO1xuXG4gIHJldHVybiBpZGJDYWNoZUV4cGlyYXRpb24uZ2V0RGIoY2FjaGVOYW1lKS50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgcmV0dXJuIGlkYkNhY2hlRXhwaXJhdGlvbi5zZXRUaW1lc3RhbXBGb3JVcmwoZGIsIHJlcXVlc3RVcmwsIG5vdyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24oZGIpIHtcbiAgICByZXR1cm4gaWRiQ2FjaGVFeHBpcmF0aW9uLmV4cGlyZUVudHJpZXMoZGIsIG1heEVudHJpZXMsIG1heEFnZVNlY29uZHMsIG5vdyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24odXJsc1RvRGVsZXRlKSB7XG4gICAgZGVidWcoJ1N1Y2Nlc3NmdWxseSB1cGRhdGVkIElEQi4nKTtcblxuICAgIHZhciBkZWxldGlvblByb21pc2VzID0gdXJsc1RvRGVsZXRlLm1hcChmdW5jdGlvbih1cmxUb0RlbGV0ZSkge1xuICAgICAgcmV0dXJuIGNhY2hlLmRlbGV0ZSh1cmxUb0RlbGV0ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoZGVsZXRpb25Qcm9taXNlcykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdEb25lIHdpdGggY2FjaGUgY2xlYW51cC4nKTtcbiAgICB9KTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICBkZWJ1ZyhlcnJvcik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5hbWVDYWNoZShzb3VyY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdSZW5hbWluZyBjYWNoZTogWycgKyBzb3VyY2UgKyAnXSB0byBbJyArIGRlc3RpbmF0aW9uICsgJ10nLCBvcHRpb25zKTtcbiAgcmV0dXJuIGNhY2hlcy5kZWxldGUoZGVzdGluYXRpb24pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGNhY2hlcy5vcGVuKHNvdXJjZSksXG4gICAgICBjYWNoZXMub3BlbihkZXN0aW5hdGlvbilcbiAgICBdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHZhciBzb3VyY2VDYWNoZSA9IHJlc3VsdHNbMF07XG4gICAgICB2YXIgZGVzdENhY2hlID0gcmVzdWx0c1sxXTtcblxuICAgICAgcmV0dXJuIHNvdXJjZUNhY2hlLmtleXMoKS50aGVuKGZ1bmN0aW9uKHJlcXVlc3RzKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXF1ZXN0cy5tYXAoZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2VDYWNoZS5tYXRjaChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVzdENhY2hlLnB1dChyZXF1ZXN0LCByZXNwb25zZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjYWNoZXMuZGVsZXRlKHNvdXJjZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZGVidWcsXG4gIGZldGNoQW5kQ2FjaGU6IGZldGNoQW5kQ2FjaGUsXG4gIG9wZW5DYWNoZTogb3BlbkNhY2hlLFxuICByZW5hbWVDYWNoZTogcmVuYW1lQ2FjaGVcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L2xpYi9oZWxwZXJzLmpzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcbiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEQl9QUkVGSVggPSAnc3ctdG9vbGJveC0nO1xudmFyIERCX1ZFUlNJT04gPSAxO1xudmFyIFNUT1JFX05BTUUgPSAnc3RvcmUnO1xudmFyIFVSTF9QUk9QRVJUWSA9ICd1cmwnO1xudmFyIFRJTUVTVEFNUF9QUk9QRVJUWSA9ICd0aW1lc3RhbXAnO1xudmFyIGNhY2hlTmFtZVRvRGJQcm9taXNlID0ge307XG5cbmZ1bmN0aW9uIG9wZW5EYihjYWNoZU5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4oREJfUFJFRklYICsgY2FjaGVOYW1lLCBEQl9WRVJTSU9OKTtcblxuICAgIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqZWN0U3RvcmUgPSByZXF1ZXN0LnJlc3VsdC5jcmVhdGVPYmplY3RTdG9yZShTVE9SRV9OQU1FLFxuICAgICAgICAgIHtrZXlQYXRoOiBVUkxfUFJPUEVSVFl9KTtcbiAgICAgIG9iamVjdFN0b3JlLmNyZWF0ZUluZGV4KFRJTUVTVEFNUF9QUk9QRVJUWSwgVElNRVNUQU1QX1BST1BFUlRZLFxuICAgICAgICAgIHt1bmlxdWU6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXNvbHZlKHJlcXVlc3QucmVzdWx0KTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERiKGNhY2hlTmFtZSkge1xuICBpZiAoIShjYWNoZU5hbWUgaW4gY2FjaGVOYW1lVG9EYlByb21pc2UpKSB7XG4gICAgY2FjaGVOYW1lVG9EYlByb21pc2VbY2FjaGVOYW1lXSA9IG9wZW5EYihjYWNoZU5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIGNhY2hlTmFtZVRvRGJQcm9taXNlW2NhY2hlTmFtZV07XG59XG5cbmZ1bmN0aW9uIHNldFRpbWVzdGFtcEZvclVybChkYiwgdXJsLCBub3cpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKFNUT1JFX05BTUUsICdyZWFkd3JpdGUnKTtcbiAgICB2YXIgb2JqZWN0U3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShTVE9SRV9OQU1FKTtcbiAgICBvYmplY3RTdG9yZS5wdXQoe3VybDogdXJsLCB0aW1lc3RhbXA6IG5vd30pO1xuXG4gICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVzb2x2ZShkYik7XG4gICAgfTtcblxuICAgIHRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdCh0cmFuc2FjdGlvbi5lcnJvcik7XG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4cGlyZU9sZEVudHJpZXMoZGIsIG1heEFnZVNlY29uZHMsIG5vdykge1xuICAvLyBCYWlsIG91dCBlYXJseSBieSByZXNvbHZpbmcgd2l0aCBhbiBlbXB0eSBhcnJheSBpZiB3ZSdyZSBub3QgdXNpbmdcbiAgLy8gbWF4QWdlU2Vjb25kcy5cbiAgaWYgKCFtYXhBZ2VTZWNvbmRzKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIG1heEFnZU1pbGxpcyA9IG1heEFnZVNlY29uZHMgKiAxMDAwO1xuICAgIHZhciB1cmxzID0gW107XG5cbiAgICB2YXIgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbihTVE9SRV9OQU1FLCAncmVhZHdyaXRlJyk7XG4gICAgdmFyIG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoU1RPUkVfTkFNRSk7XG4gICAgdmFyIGluZGV4ID0gb2JqZWN0U3RvcmUuaW5kZXgoVElNRVNUQU1QX1BST1BFUlRZKTtcblxuICAgIGluZGV4Lm9wZW5DdXJzb3IoKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihjdXJzb3JFdmVudCkge1xuICAgICAgdmFyIGN1cnNvciA9IGN1cnNvckV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICBpZiAoY3Vyc29yKSB7XG4gICAgICAgIGlmIChub3cgLSBtYXhBZ2VNaWxsaXMgPiBjdXJzb3IudmFsdWVbVElNRVNUQU1QX1BST1BFUlRZXSkge1xuICAgICAgICAgIHZhciB1cmwgPSBjdXJzb3IudmFsdWVbVVJMX1BST1BFUlRZXTtcbiAgICAgICAgICB1cmxzLnB1c2godXJsKTtcbiAgICAgICAgICBvYmplY3RTdG9yZS5kZWxldGUodXJsKTtcbiAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXNvbHZlKHVybHMpO1xuICAgIH07XG5cbiAgICB0cmFuc2FjdGlvbi5vbmFib3J0ID0gcmVqZWN0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZXhwaXJlRXh0cmFFbnRyaWVzKGRiLCBtYXhFbnRyaWVzKSB7XG4gIC8vIEJhaWwgb3V0IGVhcmx5IGJ5IHJlc29sdmluZyB3aXRoIGFuIGVtcHR5IGFycmF5IGlmIHdlJ3JlIG5vdCB1c2luZ1xuICAvLyBtYXhFbnRyaWVzLlxuICBpZiAoIW1heEVudHJpZXMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgdXJscyA9IFtdO1xuXG4gICAgdmFyIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oU1RPUkVfTkFNRSwgJ3JlYWR3cml0ZScpO1xuICAgIHZhciBvYmplY3RTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKFNUT1JFX05BTUUpO1xuICAgIHZhciBpbmRleCA9IG9iamVjdFN0b3JlLmluZGV4KFRJTUVTVEFNUF9QUk9QRVJUWSk7XG5cbiAgICB2YXIgY291bnRSZXF1ZXN0ID0gaW5kZXguY291bnQoKTtcbiAgICBpbmRleC5jb3VudCgpLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGluaXRpYWxDb3VudCA9IGNvdW50UmVxdWVzdC5yZXN1bHQ7XG5cbiAgICAgIGlmIChpbml0aWFsQ291bnQgPiBtYXhFbnRyaWVzKSB7XG4gICAgICAgIGluZGV4Lm9wZW5DdXJzb3IoKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihjdXJzb3JFdmVudCkge1xuICAgICAgICAgIHZhciBjdXJzb3IgPSBjdXJzb3JFdmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBjdXJzb3IudmFsdWVbVVJMX1BST1BFUlRZXTtcbiAgICAgICAgICAgIHVybHMucHVzaCh1cmwpO1xuICAgICAgICAgICAgb2JqZWN0U3RvcmUuZGVsZXRlKHVybCk7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbENvdW50IC0gdXJscy5sZW5ndGggPiBtYXhFbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVzb2x2ZSh1cmxzKTtcbiAgICB9O1xuXG4gICAgdHJhbnNhY3Rpb24ub25hYm9ydCA9IHJlamVjdDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4cGlyZUVudHJpZXMoZGIsIG1heEVudHJpZXMsIG1heEFnZVNlY29uZHMsIG5vdykge1xuICByZXR1cm4gZXhwaXJlT2xkRW50cmllcyhkYiwgbWF4QWdlU2Vjb25kcywgbm93KS50aGVuKGZ1bmN0aW9uKG9sZFVybHMpIHtcbiAgICByZXR1cm4gZXhwaXJlRXh0cmFFbnRyaWVzKGRiLCBtYXhFbnRyaWVzKS50aGVuKGZ1bmN0aW9uKGV4dHJhVXJscykge1xuICAgICAgcmV0dXJuIG9sZFVybHMuY29uY2F0KGV4dHJhVXJscyk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0RGI6IGdldERiLFxuICBzZXRUaW1lc3RhbXBGb3JVcmw6IHNldFRpbWVzdGFtcEZvclVybCxcbiAgZXhwaXJlRW50cmllczogZXhwaXJlRW50cmllc1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL2lkYi1jYWNoZS1leHBpcmF0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcblx0Q29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuXHRMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuXHR5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5cdFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuXHRVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5cdGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcblx0V0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5cdFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcblx0bGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5ldHdvcmtPbmx5OiByZXF1aXJlKCcuL25ldHdvcmtPbmx5JyksXG4gIG5ldHdvcmtGaXJzdDogcmVxdWlyZSgnLi9uZXR3b3JrRmlyc3QnKSxcbiAgY2FjaGVPbmx5OiByZXF1aXJlKCcuL2NhY2hlT25seScpLFxuICBjYWNoZUZpcnN0OiByZXF1aXJlKCcuL2NhY2hlRmlyc3QnKSxcbiAgZmFzdGVzdDogcmVxdWlyZSgnLi9mYXN0ZXN0Jylcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zdy10b29sYm94L2xpYi9zdHJhdGVnaWVzL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qXG5cdENvcHlyaWdodCAyMDE0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cblx0TGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcblx0eW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuXHRZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblx0VW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuXHRkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5cdFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuXHRTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5cdGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbid1c2Ugc3RyaWN0JztcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xuXG5mdW5jdGlvbiBuZXR3b3JrT25seShyZXF1ZXN0LCB2YWx1ZXMsIG9wdGlvbnMpIHtcbiAgaGVscGVycy5kZWJ1ZygnU3RyYXRlZ3k6IG5ldHdvcmsgb25seSBbJyArIHJlcXVlc3QudXJsICsgJ10nLCBvcHRpb25zKTtcbiAgcmV0dXJuIGZldGNoKHJlcXVlc3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldHdvcmtPbmx5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vc3ctdG9vbGJveC9saWIvc3RyYXRlZ2llcy9uZXR3b3JrT25seS5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKlxuIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWxPcHRpb25zID0gcmVxdWlyZSgnLi4vb3B0aW9ucycpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbmZ1bmN0aW9uIG5ldHdvcmtGaXJzdChyZXF1ZXN0LCB2YWx1ZXMsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzdWNjZXNzUmVzcG9uc2VzID0gb3B0aW9ucy5zdWNjZXNzUmVzcG9uc2VzIHx8XG4gICAgICBnbG9iYWxPcHRpb25zLnN1Y2Nlc3NSZXNwb25zZXM7XG4gIC8vIFRoaXMgd2lsbCBieXBhc3Mgb3B0aW9ucy5uZXR3b3JrVGltZW91dCBpZiBpdCdzIHNldCB0byBhIGZhbHNlLXkgdmFsdWUgbGlrZVxuICAvLyAwLCBidXQgdGhhdCdzIHRoZSBzYW5lIHRoaW5nIHRvIGRvIGFueXdheS5cbiAgdmFyIG5ldHdvcmtUaW1lb3V0U2Vjb25kcyA9IG9wdGlvbnMubmV0d29ya1RpbWVvdXRTZWNvbmRzIHx8XG4gICAgICBnbG9iYWxPcHRpb25zLm5ldHdvcmtUaW1lb3V0U2Vjb25kcztcbiAgaGVscGVycy5kZWJ1ZygnU3RyYXRlZ3k6IG5ldHdvcmsgZmlyc3QgWycgKyByZXF1ZXN0LnVybCArICddJywgb3B0aW9ucyk7XG5cbiAgcmV0dXJuIGhlbHBlcnMub3BlbkNhY2hlKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICB2YXIgdGltZW91dElkO1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHZhciBvcmlnaW5hbFJlc3BvbnNlO1xuXG4gICAgaWYgKG5ldHdvcmtUaW1lb3V0U2Vjb25kcykge1xuICAgICAgdmFyIGNhY2hlV2hlblRpbWVkT3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYWNoZS5tYXRjaChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgLy8gT25seSByZXNvbHZlIHRoaXMgcHJvbWlzZSBpZiB0aGVyZSdzIGEgdmFsaWQgcmVzcG9uc2UgaW4gdGhlXG4gICAgICAgICAgICAgIC8vIGNhY2hlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSB3b24ndCB0aW1lIG91dCBhIG5ldHdvcmsgcmVxdWVzdFxuICAgICAgICAgICAgICAvLyB1bmxlc3MgdGhlcmUncyBhIGNhY2hlZCBlbnRyeSB0byBmYWxsYmFjayBvbiwgd2hpY2ggaXMgYXJndWFibHlcbiAgICAgICAgICAgICAgLy8gdGhlIHByZWZlcmFibGUgYmVoYXZpb3IuXG4gICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBuZXR3b3JrVGltZW91dFNlY29uZHMgKiAxMDAwKTtcbiAgICAgIH0pO1xuICAgICAgcHJvbWlzZXMucHVzaChjYWNoZVdoZW5UaW1lZE91dFByb21pc2UpO1xuICAgIH1cblxuICAgIHZhciBuZXR3b3JrUHJvbWlzZSA9IGhlbHBlcnMuZmV0Y2hBbmRDYWNoZShyZXF1ZXN0LCBvcHRpb25zKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgLy8gV2UndmUgZ290IGEgcmVzcG9uc2UsIHNvIGNsZWFyIHRoZSBuZXR3b3JrIHRpbWVvdXQgaWYgdGhlcmUgaXMgb25lLlxuICAgICAgICBpZiAodGltZW91dElkKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VjY2Vzc1Jlc3BvbnNlcy50ZXN0KHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICBoZWxwZXJzLmRlYnVnKCdSZXNwb25zZSB3YXMgYW4gSFRUUCBlcnJvcjogJyArIHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgICBvcHRpb25zKTtcbiAgICAgICAgb3JpZ2luYWxSZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCByZXNwb25zZScpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIGhlbHBlcnMuZGVidWcoJ05ldHdvcmsgb3IgcmVzcG9uc2UgZXJyb3IsIGZhbGxiYWNrIHRvIGNhY2hlIFsnICtcbiAgICAgICAgICAgIHJlcXVlc3QudXJsICsgJ10nLCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlLm1hdGNoKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UgfHwgb3JpZ2luYWxSZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIHByb21pc2VzLnB1c2gobmV0d29ya1Byb21pc2UpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmFjZShwcm9taXNlcyk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldHdvcmtGaXJzdDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL3N0cmF0ZWdpZXMvbmV0d29ya0ZpcnN0LmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qXG5cdENvcHlyaWdodCAyMDE0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cblx0TGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcblx0eW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuXHRZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblx0VW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuXHRkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5cdFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuXHRTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5cdGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbid1c2Ugc3RyaWN0JztcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xuXG5mdW5jdGlvbiBjYWNoZU9ubHkocmVxdWVzdCwgdmFsdWVzLCBvcHRpb25zKSB7XG4gIGhlbHBlcnMuZGVidWcoJ1N0cmF0ZWd5OiBjYWNoZSBvbmx5IFsnICsgcmVxdWVzdC51cmwgKyAnXScsIG9wdGlvbnMpO1xuICByZXR1cm4gaGVscGVycy5vcGVuQ2FjaGUob3B0aW9ucykudGhlbihmdW5jdGlvbihjYWNoZSkge1xuICAgIHJldHVybiBjYWNoZS5tYXRjaChyZXF1ZXN0KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FjaGVPbmx5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vc3ctdG9vbGJveC9saWIvc3RyYXRlZ2llcy9jYWNoZU9ubHkuanNcbiAqKiBtb2R1bGUgaWQgPSAxM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcblx0Q29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuXHRMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuXHR5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5cdFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuXHRVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5cdGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcblx0V0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5cdFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcblx0bGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbmZ1bmN0aW9uIGNhY2hlRmlyc3QocmVxdWVzdCwgdmFsdWVzLCBvcHRpb25zKSB7XG4gIGhlbHBlcnMuZGVidWcoJ1N0cmF0ZWd5OiBjYWNoZSBmaXJzdCBbJyArIHJlcXVlc3QudXJsICsgJ10nLCBvcHRpb25zKTtcbiAgcmV0dXJuIGhlbHBlcnMub3BlbkNhY2hlKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICByZXR1cm4gY2FjaGUubWF0Y2gocmVxdWVzdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGhlbHBlcnMuZmV0Y2hBbmRDYWNoZShyZXF1ZXN0LCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FjaGVGaXJzdDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL3N0cmF0ZWdpZXMvY2FjaGVGaXJzdC5qc1xuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKlxuICBDb3B5cmlnaHQgMjAxNCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG4ndXNlIHN0cmljdCc7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBjYWNoZU9ubHkgPSByZXF1aXJlKCcuL2NhY2hlT25seScpO1xuXG5mdW5jdGlvbiBmYXN0ZXN0KHJlcXVlc3QsIHZhbHVlcywgb3B0aW9ucykge1xuICBoZWxwZXJzLmRlYnVnKCdTdHJhdGVneTogZmFzdGVzdCBbJyArIHJlcXVlc3QudXJsICsgJ10nLCBvcHRpb25zKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlamVjdGVkID0gZmFsc2U7XG4gICAgdmFyIHJlYXNvbnMgPSBbXTtcblxuICAgIHZhciBtYXliZVJlamVjdCA9IGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgcmVhc29ucy5wdXNoKHJlYXNvbi50b1N0cmluZygpKTtcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdCb3RoIGNhY2hlIGFuZCBuZXR3b3JrIGZhaWxlZDogXCInICtcbiAgICAgICAgICAgIHJlYXNvbnMuam9pbignXCIsIFwiJykgKyAnXCInKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3RlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBtYXliZVJlc29sdmUgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXliZVJlamVjdCgnTm8gcmVzdWx0IHJldHVybmVkJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGhlbHBlcnMuZmV0Y2hBbmRDYWNoZShyZXF1ZXN0LmNsb25lKCksIG9wdGlvbnMpXG4gICAgICAudGhlbihtYXliZVJlc29sdmUsIG1heWJlUmVqZWN0KTtcblxuICAgIGNhY2hlT25seShyZXF1ZXN0LCB2YWx1ZXMsIG9wdGlvbnMpXG4gICAgICAudGhlbihtYXliZVJlc29sdmUsIG1heWJlUmVqZWN0KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFzdGVzdDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3N3LXRvb2xib3gvbGliL3N0cmF0ZWdpZXMvZmFzdGVzdC5qc1xuICoqIG1vZHVsZSBpZCA9IDE1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9