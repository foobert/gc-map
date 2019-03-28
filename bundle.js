(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var mithril = createCommonjsModule(function (module) {
	(function() {
	function Vnode(tag, key, attrs0, children, text, dom) {
		return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
	}
	Vnode.normalize = function(node) {
		if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
		if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
		return node
	};
	Vnode.normalizeChildren = function normalizeChildren(children) {
		for (var i = 0; i < children.length; i++) {
			children[i] = Vnode.normalize(children[i]);
		}
		return children
	};
	var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
	var selectorCache = {};
	var hasOwn = {}.hasOwnProperty;
	function isEmpty(object) {
		for (var key in object) if (hasOwn.call(object, key)) return false
		return true
	}
	function compileSelector(selector) {
		var match, tag = "div", classes = [], attrs = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") tag = value;
			else if (type === "#") attrs.id = value;
			else if (type === ".") classes.push(value);
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
				if (match[4] === "class") classes.push(attrValue);
				else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
			}
		}
		if (classes.length > 0) attrs.className = classes.join(" ");
		return selectorCache[selector] = {tag: tag, attrs: attrs}
	}
	function execSelector(state, attrs, children) {
		var hasAttrs = false, childList, text;
		var className = attrs.className || attrs.class;
		if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
			var newAttrs = {};
			for(var key in attrs) {
				if (hasOwn.call(attrs, key)) {
					newAttrs[key] = attrs[key];
				}
			}
			attrs = newAttrs;
		}
		for (var key in state.attrs) {
			if (hasOwn.call(state.attrs, key)) {
				attrs[key] = state.attrs[key];
			}
		}
		if (className !== undefined) {
			if (attrs.class !== undefined) {
				attrs.class = undefined;
				attrs.className = className;
			}
			if (state.attrs.className != null) {
				attrs.className = state.attrs.className + " " + className;
			}
		}
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && key !== "key") {
				hasAttrs = true;
				break
			}
		}
		if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
			text = children[0].children;
		} else {
			childList = children;
		}
		return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
	}
	function hyperscript(selector) {
		// Because sloppy mode sucks
		var attrs = arguments[1], start = 2, children;
		if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
			throw Error("The selector must be either a string or a component.");
		}
		if (typeof selector === "string") {
			var cached = selectorCache[selector] || compileSelector(selector);
		}
		if (attrs == null) {
			attrs = {};
		} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
			attrs = {};
			start = 1;
		}
		if (arguments.length === start + 1) {
			children = arguments[start];
			if (!Array.isArray(children)) children = [children];
		} else {
			children = [];
			while (start < arguments.length) children.push(arguments[start++]);
		}
		var normalized = Vnode.normalizeChildren(children);
		if (typeof selector === "string") {
			return execSelector(cached, attrs, normalized)
		} else {
			return Vnode(selector, attrs.key, attrs, normalized)
		}
	}
	hyperscript.trust = function(html) {
		if (html == null) html = "";
		return Vnode("<", undefined, undefined, html, undefined, undefined)
	};
	hyperscript.fragment = function(attrs1, children) {
		return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
	};
	var m = hyperscript;
	/** @constructor */
	var PromisePolyfill = function(executor) {
		if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
		if (typeof executor !== "function") throw new TypeError("executor must be a function")
		var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
		var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
		function handler(list, shouldAbsorb) {
			return function execute(value) {
				var then;
				try {
					if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
						if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
						executeOnce(then.bind(value));
					}
					else {
						callAsync(function() {
							if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
							for (var i = 0; i < list.length; i++) list[i](value);
							resolvers.length = 0, rejectors.length = 0;
							instance.state = shouldAbsorb;
							instance.retry = function() {execute(value);};
						});
					}
				}
				catch (e) {
					rejectCurrent(e);
				}
			}
		}
		function executeOnce(then) {
			var runs = 0;
			function run(fn) {
				return function(value) {
					if (runs++ > 0) return
					fn(value);
				}
			}
			var onerror = run(rejectCurrent);
			try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
		}
		executeOnce(executor);
	};
	PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
		var self = this, instance = self._instance;
		function handle(callback, list, next, state) {
			list.push(function(value) {
				if (typeof callback !== "function") next(value);
				else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
			});
			if (typeof instance.retry === "function" && state === instance.state) instance.retry();
		}
		var resolveNext, rejectNext;
		var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
		handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
		return promise
	};
	PromisePolyfill.prototype.catch = function(onRejection) {
		return this.then(null, onRejection)
	};
	PromisePolyfill.resolve = function(value) {
		if (value instanceof PromisePolyfill) return value
		return new PromisePolyfill(function(resolve) {resolve(value);})
	};
	PromisePolyfill.reject = function(value) {
		return new PromisePolyfill(function(resolve, reject) {reject(value);})
	};
	PromisePolyfill.all = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			var total = list.length, count = 0, values = [];
			if (list.length === 0) resolve([]);
			else for (var i = 0; i < list.length; i++) {
				(function(i) {
					function consume(value) {
						count++;
						values[i] = value;
						if (count === total) resolve(values);
					}
					if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
						list[i].then(consume, reject);
					}
					else consume(list[i]);
				})(i);
			}
		})
	};
	PromisePolyfill.race = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			for (var i = 0; i < list.length; i++) {
				list[i].then(resolve, reject);
			}
		})
	};
	if (typeof window !== "undefined") {
		if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill;
		var PromisePolyfill = window.Promise;
	} else if (typeof commonjsGlobal !== "undefined") {
		if (typeof commonjsGlobal.Promise === "undefined") commonjsGlobal.Promise = PromisePolyfill;
		var PromisePolyfill = commonjsGlobal.Promise;
	}
	var buildQueryString = function(object) {
		if (Object.prototype.toString.call(object) !== "[object Object]") return ""
		var args = [];
		for (var key0 in object) {
			destructure(key0, object[key0]);
		}
		return args.join("&")
		function destructure(key0, value) {
			if (Array.isArray(value)) {
				for (var i = 0; i < value.length; i++) {
					destructure(key0 + "[" + i + "]", value[i]);
				}
			}
			else if (Object.prototype.toString.call(value) === "[object Object]") {
				for (var i in value) {
					destructure(key0 + "[" + i + "]", value[i]);
				}
			}
			else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
		}
	};
	var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i");
	var _8 = function($window, Promise) {
		var callbackCount = 0;
		var oncompletion;
		function setCompletionCallback(callback) {oncompletion = callback;}
		function finalizer() {
			var count = 0;
			function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion();}
			return function finalize(promise0) {
				var then0 = promise0.then;
				promise0.then = function() {
					count++;
					var next = then0.apply(promise0, arguments);
					next.then(complete, function(e) {
						complete();
						if (count === 0) throw e
					});
					return finalize(next)
				};
				return promise0
			}
		}
		function normalize(args, extra) {
			if (typeof args === "string") {
				var url = args;
				args = extra || {};
				if (args.url == null) args.url = url;
			}
			return args
		}
		function request(args, extra) {
			var finalize = finalizer();
			args = normalize(args, extra);
			var promise0 = new Promise(function(resolve, reject) {
				if (args.method == null) args.method = "GET";
				args.method = args.method.toUpperCase();
				var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true);
				if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify;
				if (typeof args.deserialize !== "function") args.deserialize = deserialize;
				if (typeof args.extract !== "function") args.extract = extract;
				args.url = interpolate(args.url, args.data);
				if (useBody) args.data = args.serialize(args.data);
				else args.url = assemble(args.url, args.data);
				var xhr = new $window.XMLHttpRequest(),
					aborted = false,
					_abort = xhr.abort;
				xhr.abort = function abort() {
					aborted = true;
					_abort.call(xhr);
				};
				xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
				if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
				}
				if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
					xhr.setRequestHeader("Accept", "application/json, text/*");
				}
				if (args.withCredentials) xhr.withCredentials = args.withCredentials;
				for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key]);
				}
				if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr;
				xhr.onreadystatechange = function() {
					// Don't throw errors on xhr.abort().
					if(aborted) return
					if (xhr.readyState === 4) {
						try {
							var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
							if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
								resolve(cast(args.type, response));
							}
							else {
								var error = new Error(xhr.responseText);
								for (var key in response) error[key] = response[key];
								reject(error);
							}
						}
						catch (e) {
							reject(e);
						}
					}
				};
				if (useBody && (args.data != null)) xhr.send(args.data);
				else xhr.send();
			});
			return args.background === true ? promise0 : finalize(promise0)
		}
		function jsonp(args, extra) {
			var finalize = finalizer();
			args = normalize(args, extra);
			var promise0 = new Promise(function(resolve, reject) {
				var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
				var script = $window.document.createElement("script");
				$window[callbackName] = function(data) {
					script.parentNode.removeChild(script);
					resolve(cast(args.type, data));
					delete $window[callbackName];
				};
				script.onerror = function() {
					script.parentNode.removeChild(script);
					reject(new Error("JSONP request failed"));
					delete $window[callbackName];
				};
				if (args.data == null) args.data = {};
				args.url = interpolate(args.url, args.data);
				args.data[args.callbackKey || "callback"] = callbackName;
				script.src = assemble(args.url, args.data);
				$window.document.documentElement.appendChild(script);
			});
			return args.background === true? promise0 : finalize(promise0)
		}
		function interpolate(url, data) {
			if (data == null) return url
			var tokens = url.match(/:[^\/]+/gi) || [];
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1);
				if (data[key] != null) {
					url = url.replace(tokens[i], data[key]);
				}
			}
			return url
		}
		function assemble(url, data) {
			var querystring = buildQueryString(data);
			if (querystring !== "") {
				var prefix = url.indexOf("?") < 0 ? "?" : "&";
				url += prefix + querystring;
			}
			return url
		}
		function deserialize(data) {
			try {return data !== "" ? JSON.parse(data) : null}
			catch (e) {throw new Error(data)}
		}
		function extract(xhr) {return xhr.responseText}
		function cast(type0, data) {
			if (typeof type0 === "function") {
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						data[i] = new type0(data[i]);
					}
				}
				else return new type0(data)
			}
			return data
		}
		return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
	};
	var requestService = _8(window, PromisePolyfill);
	var coreRenderer = function($window) {
		var $doc = $window.document;
		var $emptyFragment = $doc.createDocumentFragment();
		var nameSpace = {
			svg: "http://www.w3.org/2000/svg",
			math: "http://www.w3.org/1998/Math/MathML"
		};
		var onevent;
		function setEventCallback(callback) {return onevent = callback}
		function getNameSpace(vnode) {
			return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
		}
		//create
		function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					createNode(parent, vnode, hooks, ns, nextSibling);
				}
			}
		}
		function createNode(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag;
			if (typeof tag === "string") {
				vnode.state = {};
				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
				switch (tag) {
					case "#": return createText(parent, vnode, nextSibling)
					case "<": return createHTML(parent, vnode, nextSibling)
					case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
					default: return createElement(parent, vnode, hooks, ns, nextSibling)
				}
			}
			else return createComponent(parent, vnode, hooks, ns, nextSibling)
		}
		function createText(parent, vnode, nextSibling) {
			vnode.dom = $doc.createTextNode(vnode.children);
			insertNode(parent, vnode.dom, nextSibling);
			return vnode.dom
		}
		function createHTML(parent, vnode, nextSibling) {
			var match1 = vnode.children.match(/^\s*?<(\w+)/im) || [];
			var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div";
			var temp = $doc.createElement(parent1);
			temp.innerHTML = vnode.children;
			vnode.dom = temp.firstChild;
			vnode.domSize = temp.childNodes.length;
			var fragment = $doc.createDocumentFragment();
			var child;
			while (child = temp.firstChild) {
				fragment.appendChild(child);
			}
			insertNode(parent, fragment, nextSibling);
			return fragment
		}
		function createFragment(parent, vnode, hooks, ns, nextSibling) {
			var fragment = $doc.createDocumentFragment();
			if (vnode.children != null) {
				var children = vnode.children;
				createNodes(fragment, children, 0, children.length, hooks, null, ns);
			}
			vnode.dom = fragment.firstChild;
			vnode.domSize = fragment.childNodes.length;
			insertNode(parent, fragment, nextSibling);
			return fragment
		}
		function createElement(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag;
			var attrs2 = vnode.attrs;
			var is = attrs2 && attrs2.is;
			ns = getNameSpace(vnode) || ns;
			var element = ns ?
				is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
				is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
			vnode.dom = element;
			if (attrs2 != null) {
				setAttrs(vnode, attrs2, ns);
			}
			insertNode(parent, element, nextSibling);
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode);
			}
			else {
				if (vnode.text != null) {
					if (vnode.text !== "") element.textContent = vnode.text;
					else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)];
				}
				if (vnode.children != null) {
					var children = vnode.children;
					createNodes(element, children, 0, children.length, hooks, null, ns);
					setLateAttrs(vnode);
				}
			}
			return element
		}
		function initComponent(vnode, hooks) {
			var sentinel;
			if (typeof vnode.tag.view === "function") {
				vnode.state = Object.create(vnode.tag);
				sentinel = vnode.state.view;
				if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
				sentinel.$$reentrantLock$$ = true;
			} else {
				vnode.state = void 0;
				sentinel = vnode.tag;
				if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
				sentinel.$$reentrantLock$$ = true;
				vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
			}
			vnode._state = vnode.state;
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
			initLifecycle(vnode._state, vnode, hooks);
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			sentinel.$$reentrantLock$$ = null;
		}
		function createComponent(parent, vnode, hooks, ns, nextSibling) {
			initComponent(vnode, hooks);
			if (vnode.instance != null) {
				var element = createNode(parent, vnode.instance, hooks, ns, nextSibling);
				vnode.dom = vnode.instance.dom;
				vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
				insertNode(parent, element, nextSibling);
				return element
			}
			else {
				vnode.domSize = 0;
				return $emptyFragment
			}
		}
		//update
		function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
			if (old === vnodes || old == null && vnodes == null) return
			else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
			else if (vnodes == null) removeNodes(old, 0, old.length, vnodes);
			else {
				if (old.length === vnodes.length) {
					var isUnkeyed = false;
					for (var i = 0; i < vnodes.length; i++) {
						if (vnodes[i] != null && old[i] != null) {
							isUnkeyed = vnodes[i].key == null && old[i].key == null;
							break
						}
					}
					if (isUnkeyed) {
						for (var i = 0; i < old.length; i++) {
							if (old[i] === vnodes[i]) continue
							else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling));
							else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes);
							else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns);
						}
						return
					}
				}
				recycling = recycling || isRecyclable(old, vnodes);
				if (recycling) {
					var pool = old.pool;
					old = old.concat(old.pool);
				}
				var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map;
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldStart], v = vnodes[start];
					if (o === v && !recycling) oldStart++, start++;
					else if (o == null) oldStart++;
					else if (v == null) start++;
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling);
						oldStart++, start++;
						updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns);
						if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling);
					}
					else {
						var o = old[oldEnd];
						if (o === v && !recycling) oldEnd--, start++;
						else if (o == null) oldEnd--;
						else if (v == null) start++;
						else if (o.key === v.key) {
							var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
							updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
							if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling));
							oldEnd--, start++;
						}
						else break
					}
				}
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldEnd], v = vnodes[end];
					if (o === v && !recycling) oldEnd--, end--;
					else if (o == null) oldEnd--;
					else if (v == null) end--;
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
						if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling);
						if (o.dom != null) nextSibling = o.dom;
						oldEnd--, end--;
					}
					else {
						if (!map) map = getKeyMap(old, oldEnd);
						if (v != null) {
							var oldIndex = map[v.key];
							if (oldIndex != null) {
								var movable = old[oldIndex];
								var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling);
								updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
								insertNode(parent, toFragment(movable), nextSibling);
								old[oldIndex].skip = true;
								if (movable.dom != null) nextSibling = movable.dom;
							}
							else {
								var dom = createNode(parent, v, hooks, ns, nextSibling);
								nextSibling = dom;
							}
						}
						end--;
					}
					if (end < start) break
				}
				createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
				removeNodes(old, oldStart, oldEnd + 1, vnodes);
			}
		}
		function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			var oldTag = old.tag, tag = vnode.tag;
			if (oldTag === tag) {
				vnode.state = old.state;
				vnode._state = old._state;
				vnode.events = old.events;
				if (!recycling && shouldNotUpdate(vnode, old)) return
				if (typeof oldTag === "string") {
					if (vnode.attrs != null) {
						if (recycling) {
							vnode.state = {};
							initLifecycle(vnode.attrs, vnode, hooks);
						}
						else updateLifecycle(vnode.attrs, vnode, hooks);
					}
					switch (oldTag) {
						case "#": updateText(old, vnode); break
						case "<": updateHTML(parent, old, vnode, nextSibling); break
						case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
						default: updateElement(old, vnode, recycling, hooks, ns);
					}
				}
				else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns);
			}
			else {
				removeNode(old, null);
				createNode(parent, vnode, hooks, ns, nextSibling);
			}
		}
		function updateText(old, vnode) {
			if (old.children.toString() !== vnode.children.toString()) {
				old.dom.nodeValue = vnode.children;
			}
			vnode.dom = old.dom;
		}
		function updateHTML(parent, old, vnode, nextSibling) {
			if (old.children !== vnode.children) {
				toFragment(old);
				createHTML(parent, vnode, nextSibling);
			}
			else vnode.dom = old.dom, vnode.domSize = old.domSize;
		}
		function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
			updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns);
			var domSize = 0, children = vnode.children;
			vnode.dom = null;
			if (children != null) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null && child.dom != null) {
						if (vnode.dom == null) vnode.dom = child.dom;
						domSize += child.domSize || 1;
					}
				}
				if (domSize !== 1) vnode.domSize = domSize;
			}
		}
		function updateElement(old, vnode, recycling, hooks, ns) {
			var element = vnode.dom = old.dom;
			ns = getNameSpace(vnode) || ns;
			if (vnode.tag === "textarea") {
				if (vnode.attrs == null) vnode.attrs = {};
				if (vnode.text != null) {
					vnode.attrs.value = vnode.text; //FIXME handle0 multiple children
					vnode.text = undefined;
				}
			}
			updateAttrs(vnode, old.attrs, vnode.attrs, ns);
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode);
			}
			else if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text;
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)];
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)];
				updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns);
			}
		}
		function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			if (recycling) {
				initComponent(vnode, hooks);
			} else {
				vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks);
				updateLifecycle(vnode._state, vnode, hooks);
			}
			if (vnode.instance != null) {
				if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling);
				else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns);
				vnode.dom = vnode.instance.dom;
				vnode.domSize = vnode.instance.domSize;
			}
			else if (old.instance != null) {
				removeNode(old.instance, null);
				vnode.dom = undefined;
				vnode.domSize = 0;
			}
			else {
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
			}
		}
		function isRecyclable(old, vnodes) {
			if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
				var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
				var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
				var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
				if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
					return true
				}
			}
			return false
		}
		function getKeyMap(vnodes, end) {
			var map = {}, i = 0;
			for (var i = 0; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					var key2 = vnode.key;
					if (key2 != null) map[key2] = i;
				}
			}
			return map
		}
		function toFragment(vnode) {
			var count0 = vnode.domSize;
			if (count0 != null || vnode.dom == null) {
				var fragment = $doc.createDocumentFragment();
				if (count0 > 0) {
					var dom = vnode.dom;
					while (--count0) fragment.appendChild(dom.nextSibling);
					fragment.insertBefore(dom, fragment.firstChild);
				}
				return fragment
			}
			else return vnode.dom
		}
		function getNextSibling(vnodes, i, nextSibling) {
			for (; i < vnodes.length; i++) {
				if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
			}
			return nextSibling
		}
		function insertNode(parent, dom, nextSibling) {
			if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling);
			else parent.appendChild(dom);
		}
		function setContentEditable(vnode) {
			var children = vnode.children;
			if (children != null && children.length === 1 && children[0].tag === "<") {
				var content = children[0].children;
				if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
			}
			else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		}
		//remove
		function removeNodes(vnodes, start, end, context) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					if (vnode.skip) vnode.skip = false;
					else removeNode(vnode, context);
				}
			}
		}
		function removeNode(vnode, context) {
			var expected = 1, called = 0;
			if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
				var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode);
				if (result != null && typeof result.then === "function") {
					expected++;
					result.then(continuation, continuation);
				}
			}
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
				var result = vnode._state.onbeforeremove.call(vnode.state, vnode);
				if (result != null && typeof result.then === "function") {
					expected++;
					result.then(continuation, continuation);
				}
			}
			continuation();
			function continuation() {
				if (++called === expected) {
					onremove(vnode);
					if (vnode.dom) {
						var count0 = vnode.domSize || 1;
						if (count0 > 1) {
							var dom = vnode.dom;
							while (--count0) {
								removeNodeFromDOM(dom.nextSibling);
							}
						}
						removeNodeFromDOM(vnode.dom);
						if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
							if (!context.pool) context.pool = [vnode];
							else context.pool.push(vnode);
						}
					}
				}
			}
		}
		function removeNodeFromDOM(node) {
			var parent = node.parentNode;
			if (parent != null) parent.removeChild(node);
		}
		function onremove(vnode) {
			if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode);
			if (typeof vnode.tag !== "string") {
				if (typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode);
				if (vnode.instance != null) onremove(vnode.instance);
			} else {
				var children = vnode.children;
				if (Array.isArray(children)) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child != null) onremove(child);
					}
				}
			}
		}
		//attrs2
		function setAttrs(vnode, attrs2, ns) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, null, attrs2[key2], ns);
			}
		}
		function setAttr(vnode, key2, old, value, ns) {
			var element = vnode.dom;
			if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
			var nsLastIndex = key2.indexOf(":");
			if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
				element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value);
			}
			else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value);
			else if (key2 === "style") updateStyle(element, old, value);
			else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
				if (key2 === "value") {
					var normalized0 = "" + value; // eslint-disable-line no-implicit-coercion
					//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
					if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
					//setting select[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "select") {
						if (value === null) {
							if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
						} else {
							if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
						}
					}
					//setting option[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) return
				}
				// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
				if (vnode.tag === "input" && key2 === "type") {
					element.setAttribute(key2, value);
					return
				}
				element[key2] = value;
			}
			else {
				if (typeof value === "boolean") {
					if (value) element.setAttribute(key2, "");
					else element.removeAttribute(key2);
				}
				else element.setAttribute(key2 === "className" ? "class" : key2, value);
			}
		}
		function setLateAttrs(vnode) {
			var attrs2 = vnode.attrs;
			if (vnode.tag === "select" && attrs2 != null) {
				if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined);
				if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined);
			}
		}
		function updateAttrs(vnode, old, attrs2, ns) {
			if (attrs2 != null) {
				for (var key2 in attrs2) {
					setAttr(vnode, key2, old && old[key2], attrs2[key2], ns);
				}
			}
			if (old != null) {
				for (var key2 in old) {
					if (attrs2 == null || !(key2 in attrs2)) {
						if (key2 === "className") key2 = "class";
						if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined);
						else if (key2 !== "key") vnode.dom.removeAttribute(key2);
					}
				}
			}
		}
		function isFormAttribute(vnode, attr) {
			return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
		}
		function isLifecycleMethod(attr) {
			return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
		}
		function isAttribute(attr) {
			return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
		}
		function isCustomElement(vnode){
			return vnode.attrs.is || vnode.tag.indexOf("-") > -1
		}
		function hasIntegrationMethods(source) {
			return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
		}
		//style
		function updateStyle(element, old, style) {
			if (old === style) element.style.cssText = "", old = null;
			if (style == null) element.style.cssText = "";
			else if (typeof style === "string") element.style.cssText = style;
			else {
				if (typeof old === "string") element.style.cssText = "";
				for (var key2 in style) {
					element.style[key2] = style[key2];
				}
				if (old != null && typeof old !== "string") {
					for (var key2 in old) {
						if (!(key2 in style)) element.style[key2] = "";
					}
				}
			}
		}
		//event
		function updateEvent(vnode, key2, value) {
			var element = vnode.dom;
			var callback = typeof onevent !== "function" ? value : function(e) {
				var result = value.call(element, e);
				onevent.call(element, e);
				return result
			};
			if (key2 in element) element[key2] = typeof value === "function" ? callback : null;
			else {
				var eventName = key2.slice(2);
				if (vnode.events === undefined) vnode.events = {};
				if (vnode.events[key2] === callback) return
				if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false);
				if (typeof value === "function") {
					vnode.events[key2] = callback;
					element.addEventListener(eventName, vnode.events[key2], false);
				}
			}
		}
		//lifecycle
		function initLifecycle(source, vnode, hooks) {
			if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode);
			if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode));
		}
		function updateLifecycle(source, vnode, hooks) {
			if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode));
		}
		function shouldNotUpdate(vnode, old) {
			var forceVnodeUpdate, forceComponentUpdate;
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old);
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old);
			if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
				vnode.instance = old.instance;
				return true
			}
			return false
		}
		function render(dom, vnodes) {
			if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
			var hooks = [];
			var active = $doc.activeElement;
			var namespace = dom.namespaceURI;
			// First time0 rendering into a node clears it out
			if (dom.vnodes == null) dom.textContent = "";
			if (!Array.isArray(vnodes)) vnodes = [vnodes];
			updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
			dom.vnodes = vnodes;
			// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
			if (active != null && $doc.activeElement !== active) active.focus();
			for (var i = 0; i < hooks.length; i++) hooks[i]();
		}
		return {render: render, setEventCallback: setEventCallback}
	};
	function throttle(callback) {
		//60fps translates to 16.6ms, round it down since setTimeout requires int
		var time = 16;
		var last = 0, pending = null;
		var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
		return function() {
			var now = Date.now();
			if (last === 0 || now - last >= time) {
				last = now;
				callback();
			}
			else if (pending === null) {
				pending = timeout(function() {
					pending = null;
					callback();
					last = Date.now();
				}, time - (now - last));
			}
		}
	}
	var _11 = function($window) {
		var renderService = coreRenderer($window);
		renderService.setEventCallback(function(e) {
			if (e.redraw === false) e.redraw = undefined;
			else redraw();
		});
		var callbacks = [];
		function subscribe(key1, callback) {
			unsubscribe(key1);
			callbacks.push(key1, throttle(callback));
		}
		function unsubscribe(key1) {
			var index = callbacks.indexOf(key1);
			if (index > -1) callbacks.splice(index, 2);
		}
		function redraw() {
			for (var i = 1; i < callbacks.length; i += 2) {
				callbacks[i]();
			}
		}
		return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
	};
	var redrawService = _11(window);
	requestService.setCompletionCallback(redrawService.redraw);
	var _16 = function(redrawService0) {
		return function(root, component) {
			if (component === null) {
				redrawService0.render(root, []);
				redrawService0.unsubscribe(root);
				return
			}
			
			if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
			
			var run0 = function() {
				redrawService0.render(root, Vnode(component));
			};
			redrawService0.subscribe(root, run0);
			redrawService0.redraw();
		}
	};
	m.mount = _16(redrawService);
	var Promise = PromisePolyfill;
	var parseQueryString = function(string) {
		if (string === "" || string == null) return {}
		if (string.charAt(0) === "?") string = string.slice(1);
		var entries = string.split("&"), data0 = {}, counters = {};
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].split("=");
			var key5 = decodeURIComponent(entry[0]);
			var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
			if (value === "true") value = true;
			else if (value === "false") value = false;
			var levels = key5.split(/\]\[?|\[/);
			var cursor = data0;
			if (key5.indexOf("[") > -1) levels.pop();
			for (var j = 0; j < levels.length; j++) {
				var level = levels[j], nextLevel = levels[j + 1];
				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
				var isValue = j === levels.length - 1;
				if (level === "") {
					var key5 = levels.slice(0, j).join();
					if (counters[key5] == null) counters[key5] = 0;
					level = counters[key5]++;
				}
				if (cursor[level] == null) {
					cursor[level] = isValue ? value : isNumber ? [] : {};
				}
				cursor = cursor[level];
			}
		}
		return data0
	};
	var coreRouter = function($window) {
		var supportsPushState = typeof $window.history.pushState === "function";
		var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
		function normalize1(fragment0) {
			var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
			if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data;
			return data
		}
		var asyncId;
		function debounceAsync(callback0) {
			return function() {
				if (asyncId != null) return
				asyncId = callAsync0(function() {
					asyncId = null;
					callback0();
				});
			}
		}
		function parsePath(path, queryData, hashData) {
			var queryIndex = path.indexOf("?");
			var hashIndex = path.indexOf("#");
			var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
			if (queryIndex > -1) {
				var queryEnd = hashIndex > -1 ? hashIndex : path.length;
				var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
				for (var key4 in queryParams) queryData[key4] = queryParams[key4];
			}
			if (hashIndex > -1) {
				var hashParams = parseQueryString(path.slice(hashIndex + 1));
				for (var key4 in hashParams) hashData[key4] = hashParams[key4];
			}
			return path.slice(0, pathEnd)
		}
		var router = {prefix: "#!"};
		router.getPath = function() {
			var type2 = router.prefix.charAt(0);
			switch (type2) {
				case "#": return normalize1("hash").slice(router.prefix.length)
				case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
				default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
			}
		};
		router.setPath = function(path, data, options) {
			var queryData = {}, hashData = {};
			path = parsePath(path, queryData, hashData);
			if (data != null) {
				for (var key4 in data) queryData[key4] = data[key4];
				path = path.replace(/:([^\/]+)/g, function(match2, token) {
					delete queryData[token];
					return data[token]
				});
			}
			var query = buildQueryString(queryData);
			if (query) path += "?" + query;
			var hash = buildQueryString(hashData);
			if (hash) path += "#" + hash;
			if (supportsPushState) {
				var state = options ? options.state : null;
				var title = options ? options.title : null;
				$window.onpopstate();
				if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path);
				else $window.history.pushState(state, title, router.prefix + path);
			}
			else $window.location.href = router.prefix + path;
		};
		router.defineRoutes = function(routes, resolve, reject) {
			function resolveRoute() {
				var path = router.getPath();
				var params = {};
				var pathname = parsePath(path, params, params);
				var state = $window.history.state;
				if (state != null) {
					for (var k in state) params[k] = state[k];
				}
				for (var route0 in routes) {
					var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
					if (matcher.test(pathname)) {
						pathname.replace(matcher, function() {
							var keys = route0.match(/:[^\/]+/g) || [];
							var values = [].slice.call(arguments, 1, -2);
							for (var i = 0; i < keys.length; i++) {
								params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
							}
							resolve(routes[route0], params, path, route0);
						});
						return
					}
				}
				reject(path, params);
			}
			if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute);
			else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute;
			resolveRoute();
		};
		return router
	};
	var _20 = function($window, redrawService0) {
		var routeService = coreRouter($window);
		var identity = function(v) {return v};
		var render1, component, attrs3, currentPath, lastUpdate;
		var route = function(root, defaultRoute, routes) {
			if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
			var run1 = function() {
				if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)));
			};
			var bail = function(path) {
				if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true});
				else throw new Error("Could not resolve default route " + defaultRoute)
			};
			routeService.defineRoutes(routes, function(payload, params, path) {
				var update = lastUpdate = function(routeResolver, comp) {
					if (update !== lastUpdate) return
					component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
					attrs3 = params, currentPath = path, lastUpdate = null;
					render1 = (routeResolver.render || identity).bind(routeResolver);
					run1();
				};
				if (payload.view || typeof payload === "function") update({}, payload);
				else {
					if (payload.onmatch) {
						Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
							update(payload, resolved);
						}, bail);
					}
					else update(payload, "div");
				}
			}, bail);
			redrawService0.subscribe(root, run1);
		};
		route.set = function(path, data, options) {
			if (lastUpdate != null) {
				options = options || {};
				options.replace = true;
			}
			lastUpdate = null;
			routeService.setPath(path, data, options);
		};
		route.get = function() {return currentPath};
		route.prefix = function(prefix0) {routeService.prefix = prefix0;};
		route.link = function(vnode1) {
			vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href);
			vnode1.dom.onclick = function(e) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
				e.preventDefault();
				e.redraw = false;
				var href = this.getAttribute("href");
				if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length);
				route.set(href, undefined, undefined);
			};
		};
		route.param = function(key3) {
			if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
			return attrs3
		};
		return route
	};
	m.route = _20(window, redrawService);
	m.withAttr = function(attrName, callback1, context) {
		return function(e) {
			callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName));
		}
	};
	var _28 = coreRenderer(window);
	m.render = _28.render;
	m.redraw = redrawService.redraw;
	m.request = requestService.request;
	m.jsonp = requestService.jsonp;
	m.parseQueryString = parseQueryString;
	m.buildQueryString = buildQueryString;
	m.version = "1.1.6";
	m.vnode = Vnode;
	module["exports"] = m;
	}());
	});

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}

	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = ms;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* Active `debug` instances.
		*/
		createDebug.instances = [];

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms$$1 = curr - (prevTime || curr);
				self.diff = ms$$1;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return match;
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.enabled = createDebug.enabled(namespace);
			debug.useColors = createDebug.useColors();
			debug.color = selectColor(namespace);
			debug.destroy = destroy;
			debug.extend = extend;
			// Debug.formatArgs = formatArgs;
			// debug.rawLog = rawLog;

			// env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			createDebug.instances.push(debug);

			return debug;
		}

		function destroy() {
			const index = createDebug.instances.indexOf(this);
			if (index !== -1) {
				createDebug.instances.splice(index, 1);
				return true;
			}
			return false;
		}

		function extend(namespace, delimiter) {
			return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}

			for (i = 0; i < createDebug.instances.length; i++) {
				const instance = createDebug.instances[i];
				instance.enabled = createDebug.enabled(instance.namespace);
			}
		}

		/**
		* Disable debug output.
		*
		* @api public
		*/
		function disable() {
			createDebug.enable('');
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	var common = setup;

	var browser = createCommonjsModule(function (module, exports) {
	/* eslint-env browser */

	/**
	 * This is the web browser implementation of `debug()`.
	 */

	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}

		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}

		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);

		if (!this.useColors) {
			return;
		}

		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');

		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});

		args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	function log(...args) {
		// This hackery is required for IE8/9, where
		// the `console.log` function doesn't have 'apply'
		return typeof console === 'object' &&
			console.log &&
			console.log(...args);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}

		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = process.env.DEBUG;
		}

		return r;
	}

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	module.exports = common(exports);

	const {formatters} = module.exports;

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	});
	var browser_1 = browser.log;
	var browser_2 = browser.formatArgs;
	var browser_3 = browser.save;
	var browser_4 = browser.load;
	var browser_5 = browser.useColors;
	var browser_6 = browser.storage;
	var browser_7 = browser.colors;

	const debug = browser("gc:map:state");

	let state = {
	  map: {
	    filter: {
	      open: false,
	      users: {},
	      types: {
	        traditional: true,
	        multi: true
	      },
	      favpoints: null
	    },
	    types: {
	      open: false
	    },
	    details: {
	      open: false,
	      gc: null
	    },
	    center: [51.340081, 12.375837],
	    zoom: 13,
	    layers: ["gc"]
	  }
	};

	function save() {
	  localStorage.setItem("state", JSON.stringify(state));
	  debug("Save: %o", state);
	}

	function load() {
	  const json = localStorage.getItem("state");
	  if (json) {
	    Object.assign(state, JSON.parse(localStorage.state));
	  }
	  if (!state.map.filter.types) {
	    state.map.filter.types = {};
	  }
	  if (!state.map.layers) {
	    state.map.layers = ["gc"];
	  }
	  debug("Load: %o", state);
	}

	function create() {
	  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	    attribution: "foo",
	    maxZoom: 18
	  });
	}

	var eventemitter3 = createCommonjsModule(function (module) {

	var has = Object.prototype.hasOwnProperty
	  , prefix = '~';

	/**
	 * Constructor to create a storage for our `EE` objects.
	 * An `Events` instance is a plain object whose properties are event names.
	 *
	 * @constructor
	 * @private
	 */
	function Events() {}

	//
	// We try to not inherit from `Object.prototype`. In some engines creating an
	// instance in this way is faster than calling `Object.create(null)` directly.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// character to make sure that the built-in object properties are not
	// overridden or used as an attack vector.
	//
	if (Object.create) {
	  Events.prototype = Object.create(null);

	  //
	  // This hack is needed because the `__proto__` property is still inherited in
	  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
	  //
	  if (!new Events().__proto__) prefix = false;
	}

	/**
	 * Representation of a single event listener.
	 *
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	 * @constructor
	 * @private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Add a listener for a given event.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} once Specify if the listener is a one-time listener.
	 * @returns {EventEmitter}
	 * @private
	 */
	function addListener(emitter, event, fn, context, once) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('The listener must be a function');
	  }

	  var listener = new EE(fn, context || emitter, once)
	    , evt = prefix ? prefix + event : event;

	  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
	  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
	  else emitter._events[evt] = [emitter._events[evt], listener];

	  return emitter;
	}

	/**
	 * Clear event by name.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} evt The Event name.
	 * @private
	 */
	function clearEvent(emitter, evt) {
	  if (--emitter._eventsCount === 0) emitter._events = new Events();
	  else delete emitter._events[evt];
	}

	/**
	 * Minimal `EventEmitter` interface that is molded against the Node.js
	 * `EventEmitter` interface.
	 *
	 * @constructor
	 * @public
	 */
	function EventEmitter() {
	  this._events = new Events();
	  this._eventsCount = 0;
	}

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var names = []
	    , events
	    , name;

	  if (this._eventsCount === 0) return names;

	  for (name in (events = this._events)) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Array} The registered listeners.
	 * @public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
	  var evt = prefix ? prefix + event : event
	    , handlers = this._events[evt];

	  if (!handlers) return [];
	  if (handlers.fn) return [handlers.fn];

	  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
	    ee[i] = handlers[i].fn;
	  }

	  return ee;
	};

	/**
	 * Return the number of listeners listening to a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Number} The number of listeners.
	 * @public
	 */
	EventEmitter.prototype.listenerCount = function listenerCount(event) {
	  var evt = prefix ? prefix + event : event
	    , listeners = this._events[evt];

	  if (!listeners) return 0;
	  if (listeners.fn) return 1;
	  return listeners.length;
	};

	/**
	 * Calls each of the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Boolean} `true` if the event had listeners, else `false`.
	 * @public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return false;

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if (listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Add a listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  return addListener(this, event, fn, context, false);
	};

	/**
	 * Add a one-time listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  return addListener(this, event, fn, context, true);
	};

	/**
	 * Remove the listeners of a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn Only remove the listeners that match this function.
	 * @param {*} context Only remove the listeners that have this context.
	 * @param {Boolean} once Only remove one-time listeners.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return this;
	  if (!fn) {
	    clearEvent(this, evt);
	    return this;
	  }

	  var listeners = this._events[evt];

	  if (listeners.fn) {
	    if (
	      listeners.fn === fn &&
	      (!once || listeners.once) &&
	      (!context || listeners.context === context)
	    ) {
	      clearEvent(this, evt);
	    }
	  } else {
	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
	      if (
	        listeners[i].fn !== fn ||
	        (once && !listeners[i].once) ||
	        (context && listeners[i].context !== context)
	      ) {
	        events.push(listeners[i]);
	      }
	    }

	    //
	    // Reset the array, or remove it completely if we have no more listeners.
	    //
	    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
	    else clearEvent(this, evt);
	  }

	  return this;
	};

	/**
	 * Remove all listeners, or those of the specified event.
	 *
	 * @param {(String|Symbol)} [event] The event name.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  var evt;

	  if (event) {
	    evt = prefix ? prefix + event : event;
	    if (this._events[evt]) clearEvent(this, evt);
	  } else {
	    this._events = new Events();
	    this._eventsCount = 0;
	  }

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Allow `EventEmitter` to be imported as module namespace.
	//
	EventEmitter.EventEmitter = EventEmitter;

	//
	// Expose the module.
	//
	{
	  module.exports = EventEmitter;
	}
	});

	// Port of lower_bound from http://en.cppreference.com/w/cpp/algorithm/lower_bound
	// Used to compute insertion index to keep queue sorted after insertion
	function lowerBound(array, value, comp) {
		let first = 0;
		let count = array.length;

		while (count > 0) {
			const step = (count / 2) | 0;
			let it = first + step;

			if (comp(array[it], value) <= 0) {
				first = ++it;
				count -= step + 1;
			} else {
				count = step;
			}
		}

		return first;
	}

	class PriorityQueue {
		constructor() {
			this._queue = [];
		}

		enqueue(run, options) {
			options = Object.assign({
				priority: 0
			}, options);

			const element = {priority: options.priority, run};

			if (this.size && this._queue[this.size - 1].priority >= options.priority) {
				this._queue.push(element);
				return;
			}

			const index = lowerBound(this._queue, element, (a, b) => b.priority - a.priority);
			this._queue.splice(index, 0, element);
		}

		dequeue() {
			return this._queue.shift().run;
		}

		get size() {
			return this._queue.length;
		}
	}

	class PQueue extends eventemitter3 {
		constructor(options) {
			super();

			options = Object.assign({
				carryoverConcurrencyCount: false,
				intervalCap: Infinity,
				interval: 0,
				concurrency: Infinity,
				autoStart: true,
				queueClass: PriorityQueue
			}, options);

			if (!(typeof options.concurrency === 'number' && options.concurrency >= 1)) {
				throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${options.concurrency}\` (${typeof options.concurrency})`);
			}

			if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
				throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap}\` (${typeof options.intervalCap})`);
			}

			if (!(Number.isFinite(options.interval) && options.interval >= 0)) {
				throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval}\` (${typeof options.interval})`);
			}

			this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
			this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
			this._intervalCount = 0;
			this._intervalCap = options.intervalCap;
			this._interval = options.interval;
			this._intervalId = null;
			this._intervalEnd = 0;
			this._timeoutId = null;

			this.queue = new options.queueClass(); // eslint-disable-line new-cap
			this._queueClass = options.queueClass;
			this._pendingCount = 0;
			this._concurrency = options.concurrency;
			this._isPaused = options.autoStart === false;
			this._resolveEmpty = () => {};
			this._resolveIdle = () => {};
		}

		get _doesIntervalAllowAnother() {
			return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
		}

		get _doesConcurrentAllowAnother() {
			return this._pendingCount < this._concurrency;
		}

		_next() {
			this._pendingCount--;
			this._tryToStartAnother();
		}

		_resolvePromises() {
			this._resolveEmpty();
			this._resolveEmpty = () => {};

			if (this._pendingCount === 0) {
				this._resolveIdle();
				this._resolveIdle = () => {};
			}
		}

		_onResumeInterval() {
			this._onInterval();
			this._initializeIntervalIfNeeded();
			this._timeoutId = null;
		}

		_intervalPaused() {
			const now = Date.now();

			if (this._intervalId === null) {
				const delay = this._intervalEnd - now;
				if (delay < 0) {
					// Act as the interval was done
					// We don't need to resume it here,
					// because it'll be resumed on line 160
					this._intervalCount = (this._carryoverConcurrencyCount) ? this._pendingCount : 0;
				} else {
					// Act as the interval is pending
					if (this._timeoutId === null) {
						this._timeoutId = setTimeout(() => this._onResumeInterval(), delay);
					}

					return true;
				}
			}

			return false;
		}

		_tryToStartAnother() {
			if (this.queue.size === 0) {
				// We can clear the interval ("pause")
				// because we can redo it later ("resume")
				clearInterval(this._intervalId);
				this._intervalId = null;

				this._resolvePromises();

				return false;
			}

			if (!this._isPaused) {
				const canInitializeInterval = !this._intervalPaused();
				if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
					this.emit('active');
					this.queue.dequeue()();
					if (canInitializeInterval) {
						this._initializeIntervalIfNeeded();
					}

					return true;
				}
			}

			return false;
		}

		_initializeIntervalIfNeeded() {
			if (this._isIntervalIgnored || this._intervalId !== null) {
				return;
			}

			this._intervalId = setInterval(() => this._onInterval(), this._interval);
			this._intervalEnd = Date.now() + this._interval;
		}

		_onInterval() {
			if (this._intervalCount === 0 && this._pendingCount === 0) {
				clearInterval(this._intervalId);
				this._intervalId = null;
			}

			this._intervalCount = (this._carryoverConcurrencyCount) ? this._pendingCount : 0;
			while (this._tryToStartAnother()) {} // eslint-disable-line no-empty
		}

		add(fn, options) {
			return new Promise((resolve, reject) => {
				const run = () => {
					this._pendingCount++;
					this._intervalCount++;

					try {
						Promise.resolve(fn()).then(
							val => {
								resolve(val);
								this._next();
							},
							err => {
								reject(err);
								this._next();
							}
						);
					} catch (error) {
						reject(error);
						this._next();
					}
				};

				this.queue.enqueue(run, options);
				this._tryToStartAnother();
			});
		}

		addAll(fns, options) {
			return Promise.all(fns.map(fn => this.add(fn, options)));
		}

		start() {
			if (!this._isPaused) {
				return;
			}

			this._isPaused = false;
			while (this._tryToStartAnother()) {} // eslint-disable-line no-empty
		}

		pause() {
			this._isPaused = true;
		}

		clear() {
			this.queue = new this._queueClass();
		}

		onEmpty() {
			// Instantly resolve if the queue is empty
			if (this.queue.size === 0) {
				return Promise.resolve();
			}

			return new Promise(resolve => {
				const existingResolve = this._resolveEmpty;
				this._resolveEmpty = () => {
					existingResolve();
					resolve();
				};
			});
		}

		onIdle() {
			// Instantly resolve if none pending and if nothing else is queued
			if (this._pendingCount === 0 && this.queue.size === 0) {
				return Promise.resolve();
			}

			return new Promise(resolve => {
				const existingResolve = this._resolveIdle;
				this._resolveIdle = () => {
					existingResolve();
					resolve();
				};
			});
		}

		get size() {
			return this.queue.size;
		}

		get pending() {
			return this._pendingCount;
		}

		get isPaused() {
			return this._isPaused;
		}
	}

	var pQueue = PQueue;
	var default_1 = PQueue;
	pQueue.default = default_1;

	var iterator = function (Yallist) {
	  Yallist.prototype[Symbol.iterator] = function* () {
	    for (let walker = this.head; walker; walker = walker.next) {
	      yield walker.value;
	    }
	  };
	};

	var yallist = Yallist;

	Yallist.Node = Node;
	Yallist.create = Yallist;

	function Yallist (list) {
	  var self = this;
	  if (!(self instanceof Yallist)) {
	    self = new Yallist();
	  }

	  self.tail = null;
	  self.head = null;
	  self.length = 0;

	  if (list && typeof list.forEach === 'function') {
	    list.forEach(function (item) {
	      self.push(item);
	    });
	  } else if (arguments.length > 0) {
	    for (var i = 0, l = arguments.length; i < l; i++) {
	      self.push(arguments[i]);
	    }
	  }

	  return self
	}

	Yallist.prototype.removeNode = function (node) {
	  if (node.list !== this) {
	    throw new Error('removing node which does not belong to this list')
	  }

	  var next = node.next;
	  var prev = node.prev;

	  if (next) {
	    next.prev = prev;
	  }

	  if (prev) {
	    prev.next = next;
	  }

	  if (node === this.head) {
	    this.head = next;
	  }
	  if (node === this.tail) {
	    this.tail = prev;
	  }

	  node.list.length--;
	  node.next = null;
	  node.prev = null;
	  node.list = null;
	};

	Yallist.prototype.unshiftNode = function (node) {
	  if (node === this.head) {
	    return
	  }

	  if (node.list) {
	    node.list.removeNode(node);
	  }

	  var head = this.head;
	  node.list = this;
	  node.next = head;
	  if (head) {
	    head.prev = node;
	  }

	  this.head = node;
	  if (!this.tail) {
	    this.tail = node;
	  }
	  this.length++;
	};

	Yallist.prototype.pushNode = function (node) {
	  if (node === this.tail) {
	    return
	  }

	  if (node.list) {
	    node.list.removeNode(node);
	  }

	  var tail = this.tail;
	  node.list = this;
	  node.prev = tail;
	  if (tail) {
	    tail.next = node;
	  }

	  this.tail = node;
	  if (!this.head) {
	    this.head = node;
	  }
	  this.length++;
	};

	Yallist.prototype.push = function () {
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    push(this, arguments[i]);
	  }
	  return this.length
	};

	Yallist.prototype.unshift = function () {
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    unshift(this, arguments[i]);
	  }
	  return this.length
	};

	Yallist.prototype.pop = function () {
	  if (!this.tail) {
	    return undefined
	  }

	  var res = this.tail.value;
	  this.tail = this.tail.prev;
	  if (this.tail) {
	    this.tail.next = null;
	  } else {
	    this.head = null;
	  }
	  this.length--;
	  return res
	};

	Yallist.prototype.shift = function () {
	  if (!this.head) {
	    return undefined
	  }

	  var res = this.head.value;
	  this.head = this.head.next;
	  if (this.head) {
	    this.head.prev = null;
	  } else {
	    this.tail = null;
	  }
	  this.length--;
	  return res
	};

	Yallist.prototype.forEach = function (fn, thisp) {
	  thisp = thisp || this;
	  for (var walker = this.head, i = 0; walker !== null; i++) {
	    fn.call(thisp, walker.value, i, this);
	    walker = walker.next;
	  }
	};

	Yallist.prototype.forEachReverse = function (fn, thisp) {
	  thisp = thisp || this;
	  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
	    fn.call(thisp, walker.value, i, this);
	    walker = walker.prev;
	  }
	};

	Yallist.prototype.get = function (n) {
	  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
	    // abort out of the list early if we hit a cycle
	    walker = walker.next;
	  }
	  if (i === n && walker !== null) {
	    return walker.value
	  }
	};

	Yallist.prototype.getReverse = function (n) {
	  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
	    // abort out of the list early if we hit a cycle
	    walker = walker.prev;
	  }
	  if (i === n && walker !== null) {
	    return walker.value
	  }
	};

	Yallist.prototype.map = function (fn, thisp) {
	  thisp = thisp || this;
	  var res = new Yallist();
	  for (var walker = this.head; walker !== null;) {
	    res.push(fn.call(thisp, walker.value, this));
	    walker = walker.next;
	  }
	  return res
	};

	Yallist.prototype.mapReverse = function (fn, thisp) {
	  thisp = thisp || this;
	  var res = new Yallist();
	  for (var walker = this.tail; walker !== null;) {
	    res.push(fn.call(thisp, walker.value, this));
	    walker = walker.prev;
	  }
	  return res
	};

	Yallist.prototype.reduce = function (fn, initial) {
	  var acc;
	  var walker = this.head;
	  if (arguments.length > 1) {
	    acc = initial;
	  } else if (this.head) {
	    walker = this.head.next;
	    acc = this.head.value;
	  } else {
	    throw new TypeError('Reduce of empty list with no initial value')
	  }

	  for (var i = 0; walker !== null; i++) {
	    acc = fn(acc, walker.value, i);
	    walker = walker.next;
	  }

	  return acc
	};

	Yallist.prototype.reduceReverse = function (fn, initial) {
	  var acc;
	  var walker = this.tail;
	  if (arguments.length > 1) {
	    acc = initial;
	  } else if (this.tail) {
	    walker = this.tail.prev;
	    acc = this.tail.value;
	  } else {
	    throw new TypeError('Reduce of empty list with no initial value')
	  }

	  for (var i = this.length - 1; walker !== null; i--) {
	    acc = fn(acc, walker.value, i);
	    walker = walker.prev;
	  }

	  return acc
	};

	Yallist.prototype.toArray = function () {
	  var arr = new Array(this.length);
	  for (var i = 0, walker = this.head; walker !== null; i++) {
	    arr[i] = walker.value;
	    walker = walker.next;
	  }
	  return arr
	};

	Yallist.prototype.toArrayReverse = function () {
	  var arr = new Array(this.length);
	  for (var i = 0, walker = this.tail; walker !== null; i++) {
	    arr[i] = walker.value;
	    walker = walker.prev;
	  }
	  return arr
	};

	Yallist.prototype.slice = function (from, to) {
	  to = to || this.length;
	  if (to < 0) {
	    to += this.length;
	  }
	  from = from || 0;
	  if (from < 0) {
	    from += this.length;
	  }
	  var ret = new Yallist();
	  if (to < from || to < 0) {
	    return ret
	  }
	  if (from < 0) {
	    from = 0;
	  }
	  if (to > this.length) {
	    to = this.length;
	  }
	  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
	    walker = walker.next;
	  }
	  for (; walker !== null && i < to; i++, walker = walker.next) {
	    ret.push(walker.value);
	  }
	  return ret
	};

	Yallist.prototype.sliceReverse = function (from, to) {
	  to = to || this.length;
	  if (to < 0) {
	    to += this.length;
	  }
	  from = from || 0;
	  if (from < 0) {
	    from += this.length;
	  }
	  var ret = new Yallist();
	  if (to < from || to < 0) {
	    return ret
	  }
	  if (from < 0) {
	    from = 0;
	  }
	  if (to > this.length) {
	    to = this.length;
	  }
	  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
	    walker = walker.prev;
	  }
	  for (; walker !== null && i > from; i--, walker = walker.prev) {
	    ret.push(walker.value);
	  }
	  return ret
	};

	Yallist.prototype.reverse = function () {
	  var head = this.head;
	  var tail = this.tail;
	  for (var walker = head; walker !== null; walker = walker.prev) {
	    var p = walker.prev;
	    walker.prev = walker.next;
	    walker.next = p;
	  }
	  this.head = tail;
	  this.tail = head;
	  return this
	};

	function push (self, item) {
	  self.tail = new Node(item, self.tail, null, self);
	  if (!self.head) {
	    self.head = self.tail;
	  }
	  self.length++;
	}

	function unshift (self, item) {
	  self.head = new Node(item, null, self.head, self);
	  if (!self.tail) {
	    self.tail = self.head;
	  }
	  self.length++;
	}

	function Node (value, prev, next, list) {
	  if (!(this instanceof Node)) {
	    return new Node(value, prev, next, list)
	  }

	  this.list = list;
	  this.value = value;

	  if (prev) {
	    prev.next = this;
	    this.prev = prev;
	  } else {
	    this.prev = null;
	  }

	  if (next) {
	    next.prev = this;
	    this.next = next;
	  } else {
	    this.next = null;
	  }
	}

	try {
	  // add if support for Symbol.iterator is present
	  iterator(Yallist);
	} catch (er) {}

	// A linked list to keep track of recently-used-ness


	const MAX = Symbol('max');
	const LENGTH = Symbol('length');
	const LENGTH_CALCULATOR = Symbol('lengthCalculator');
	const ALLOW_STALE = Symbol('allowStale');
	const MAX_AGE = Symbol('maxAge');
	const DISPOSE = Symbol('dispose');
	const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
	const LRU_LIST = Symbol('lruList');
	const CACHE = Symbol('cache');
	const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

	const naiveLength = () => 1;

	// lruList is a yallist where the head is the youngest
	// item, and the tail is the oldest.  the list contains the Hit
	// objects as the entries.
	// Each Hit object has a reference to its Yallist.Node.  This
	// never changes.
	//
	// cache is a Map (or PseudoMap) that matches the keys to
	// the Yallist.Node object.
	class LRUCache {
	  constructor (options) {
	    if (typeof options === 'number')
	      options = { max: options };

	    if (!options)
	      options = {};

	    if (options.max && (typeof options.max !== 'number' || options.max < 0))
	      throw new TypeError('max must be a non-negative number')
	    // Kind of weird to have a default max of Infinity, but oh well.
	    const max = this[MAX] = options.max || Infinity;

	    const lc = options.length || naiveLength;
	    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
	    this[ALLOW_STALE] = options.stale || false;
	    if (options.maxAge && typeof options.maxAge !== 'number')
	      throw new TypeError('maxAge must be a number')
	    this[MAX_AGE] = options.maxAge || 0;
	    this[DISPOSE] = options.dispose;
	    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
	    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
	    this.reset();
	  }

	  // resize the cache when the max changes.
	  set max (mL) {
	    if (typeof mL !== 'number' || mL < 0)
	      throw new TypeError('max must be a non-negative number')

	    this[MAX] = mL || Infinity;
	    trim(this);
	  }
	  get max () {
	    return this[MAX]
	  }

	  set allowStale (allowStale) {
	    this[ALLOW_STALE] = !!allowStale;
	  }
	  get allowStale () {
	    return this[ALLOW_STALE]
	  }

	  set maxAge (mA) {
	    if (typeof mA !== 'number')
	      throw new TypeError('maxAge must be a non-negative number')

	    this[MAX_AGE] = mA;
	    trim(this);
	  }
	  get maxAge () {
	    return this[MAX_AGE]
	  }

	  // resize the cache when the lengthCalculator changes.
	  set lengthCalculator (lC) {
	    if (typeof lC !== 'function')
	      lC = naiveLength;

	    if (lC !== this[LENGTH_CALCULATOR]) {
	      this[LENGTH_CALCULATOR] = lC;
	      this[LENGTH] = 0;
	      this[LRU_LIST].forEach(hit => {
	        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
	        this[LENGTH] += hit.length;
	      });
	    }
	    trim(this);
	  }
	  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

	  get length () { return this[LENGTH] }
	  get itemCount () { return this[LRU_LIST].length }

	  rforEach (fn, thisp) {
	    thisp = thisp || this;
	    for (let walker = this[LRU_LIST].tail; walker !== null;) {
	      const prev = walker.prev;
	      forEachStep(this, fn, walker, thisp);
	      walker = prev;
	    }
	  }

	  forEach (fn, thisp) {
	    thisp = thisp || this;
	    for (let walker = this[LRU_LIST].head; walker !== null;) {
	      const next = walker.next;
	      forEachStep(this, fn, walker, thisp);
	      walker = next;
	    }
	  }

	  keys () {
	    return this[LRU_LIST].toArray().map(k => k.key)
	  }

	  values () {
	    return this[LRU_LIST].toArray().map(k => k.value)
	  }

	  reset () {
	    if (this[DISPOSE] &&
	        this[LRU_LIST] &&
	        this[LRU_LIST].length) {
	      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
	    }

	    this[CACHE] = new Map(); // hash of items by key
	    this[LRU_LIST] = new yallist(); // list of items in order of use recency
	    this[LENGTH] = 0; // length of items in the list
	  }

	  dump () {
	    return this[LRU_LIST].map(hit =>
	      isStale(this, hit) ? false : {
	        k: hit.key,
	        v: hit.value,
	        e: hit.now + (hit.maxAge || 0)
	      }).toArray().filter(h => h)
	  }

	  dumpLru () {
	    return this[LRU_LIST]
	  }

	  set (key, value, maxAge) {
	    maxAge = maxAge || this[MAX_AGE];

	    if (maxAge && typeof maxAge !== 'number')
	      throw new TypeError('maxAge must be a number')

	    const now = maxAge ? Date.now() : 0;
	    const len = this[LENGTH_CALCULATOR](value, key);

	    if (this[CACHE].has(key)) {
	      if (len > this[MAX]) {
	        del(this, this[CACHE].get(key));
	        return false
	      }

	      const node = this[CACHE].get(key);
	      const item = node.value;

	      // dispose of the old one before overwriting
	      // split out into 2 ifs for better coverage tracking
	      if (this[DISPOSE]) {
	        if (!this[NO_DISPOSE_ON_SET])
	          this[DISPOSE](key, item.value);
	      }

	      item.now = now;
	      item.maxAge = maxAge;
	      item.value = value;
	      this[LENGTH] += len - item.length;
	      item.length = len;
	      this.get(key);
	      trim(this);
	      return true
	    }

	    const hit = new Entry(key, value, len, now, maxAge);

	    // oversized objects fall out of cache automatically.
	    if (hit.length > this[MAX]) {
	      if (this[DISPOSE])
	        this[DISPOSE](key, value);

	      return false
	    }

	    this[LENGTH] += hit.length;
	    this[LRU_LIST].unshift(hit);
	    this[CACHE].set(key, this[LRU_LIST].head);
	    trim(this);
	    return true
	  }

	  has (key) {
	    if (!this[CACHE].has(key)) return false
	    const hit = this[CACHE].get(key).value;
	    return !isStale(this, hit)
	  }

	  get (key) {
	    return get(this, key, true)
	  }

	  peek (key) {
	    return get(this, key, false)
	  }

	  pop () {
	    const node = this[LRU_LIST].tail;
	    if (!node)
	      return null

	    del(this, node);
	    return node.value
	  }

	  del (key) {
	    del(this, this[CACHE].get(key));
	  }

	  load (arr) {
	    // reset the cache
	    this.reset();

	    const now = Date.now();
	    // A previous serialized cache has the most recent items first
	    for (let l = arr.length - 1; l >= 0; l--) {
	      const hit = arr[l];
	      const expiresAt = hit.e || 0;
	      if (expiresAt === 0)
	        // the item was created without expiration in a non aged cache
	        this.set(hit.k, hit.v);
	      else {
	        const maxAge = expiresAt - now;
	        // dont add already expired items
	        if (maxAge > 0) {
	          this.set(hit.k, hit.v, maxAge);
	        }
	      }
	    }
	  }

	  prune () {
	    this[CACHE].forEach((value, key) => get(this, key, false));
	  }
	}

	const get = (self, key, doUse) => {
	  const node = self[CACHE].get(key);
	  if (node) {
	    const hit = node.value;
	    if (isStale(self, hit)) {
	      del(self, node);
	      if (!self[ALLOW_STALE])
	        return undefined
	    } else {
	      if (doUse) {
	        if (self[UPDATE_AGE_ON_GET])
	          node.value.now = Date.now();
	        self[LRU_LIST].unshiftNode(node);
	      }
	    }
	    return hit.value
	  }
	};

	const isStale = (self, hit) => {
	  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
	    return false

	  const diff = Date.now() - hit.now;
	  return hit.maxAge ? diff > hit.maxAge
	    : self[MAX_AGE] && (diff > self[MAX_AGE])
	};

	const trim = self => {
	  if (self[LENGTH] > self[MAX]) {
	    for (let walker = self[LRU_LIST].tail;
	      self[LENGTH] > self[MAX] && walker !== null;) {
	      // We know that we're about to delete this one, and also
	      // what the next least recently used key will be, so just
	      // go ahead and set it now.
	      const prev = walker.prev;
	      del(self, walker);
	      walker = prev;
	    }
	  }
	};

	const del = (self, node) => {
	  if (node) {
	    const hit = node.value;
	    if (self[DISPOSE])
	      self[DISPOSE](hit.key, hit.value);

	    self[LENGTH] -= hit.length;
	    self[CACHE].delete(hit.key);
	    self[LRU_LIST].removeNode(node);
	  }
	};

	class Entry {
	  constructor (key, value, length, now, maxAge) {
	    this.key = key;
	    this.value = value;
	    this.length = length;
	    this.now = now;
	    this.maxAge = maxAge || 0;
	  }
	}

	const forEachStep = (self, fn, node, thisp) => {
	  let hit = node.value;
	  if (isStale(self, hit)) {
	    del(self, node);
	    if (!self[ALLOW_STALE])
	      hit = undefined;
	  }
	  if (hit)
	    fn.call(thisp, hit.value, hit.key, self);
	};

	var lruCache = LRUCache;

	const debug$1 = browser("gc:map:cache");

	let saveTimer = null;
	const cache = new lruCache({
	  max: 10000,
	  length: n => n.length,
	  maxAge: getMaxAge()
	});

	restore();

	async function lookup(key, loader) {
	  let value = lookupWithShorterKeys(key);
	  if (!value) {
	    value = await loader(key);
	    cache.set(key, value);

	    if (saveTimer) {
	      clearTimeout(saveTimer);
	    }
	    saveTimer = setTimeout(save$1, 1000);
	  }
	  return value;
	}

	function lookupWithShorterKeys(key) {
	  let value = cache.get(key);
	  if (value) {
	    return value;
	  } else if (key.length > 1) {
	    return lookupWithShorterKeys(key.substr(0, key.length - 1));
	  } else {
	    return null;
	  }
	}

	function restore() {
	  try {
	    load$1();
	  } catch (err) {
	    debug$1("Cache restore failed: %o", err);
	    localStorage.removeItem("cache");
	  }
	}

	function load$1() {
	  const data = JSON.parse(localStorage.getItem("cache"));
	  if (data) {
	    cache.load(data);
	  }
	}
	function save$1() {
	  debug$1("Cache saved");
	  const data = JSON.stringify(cache.dump());
	  localStorage.setItem("cache", data);
	}

	function getMaxAge() {
	  const maxAgeMinutes = parseInt(localStorage.getItem("maxAge")) || 5;
	  debug$1("Cache maxAge: %d minutes", maxAgeMinutes);
	  return 1000 * 60 * maxAgeMinutes;
	}

	const debug$2 = browser("gc:map:tree");
	const backendUrl = getBackendUrl();
	const queue = new pQueue({ concurrency: 10 });
	let inflightRequests = 0;

	function getInflightRequests() {
	  return inflightRequests;
	}

	async function lookup$1(quadkey) {
	  return lookup(quadkey, fetch);
	}

	async function fetch(quadkey) {
	  return queue.add(() => fetchRequest(quadkey));
	}

	function getBackendUrl() {
	  const defaultUrl = "https://gc.funkenburg.net/api/graphql";
	  const override = localStorage.getItem("backend");
	  const backendUrl = override || defaultUrl;
	  debug$2("Using backend %s", backendUrl);
	  return backendUrl;
	}

	async function fetchRequest(quadkey) {
	  inflightRequests++;
	  return mithril
	    .request({
	      method: "POST",
	      url: backendUrl,
	      data: {
	        query:
	          "{ geocaches(quadkey: " +
	          JSON.stringify(quadkey) +
	          ", exclude: " +
	          JSON.stringify(Object.keys(state.map.filter.users || {})) +
	          ") { nodes { id api_date parsed { lat lon name type size difficulty terrain hint disabled favpoints attributes { id active }} } } }"
	      }
	    })
	    .then(res => {
	      inflightRequests--;
	      return res.data.geocaches.nodes;
	    })
	    .catch(() => {
	      inflightRequests--;
	      return [];
	    });
	}

	function toQuadKey(tileX, tileY, zoom) {
	  let quadKey = [];
	  for (let i = zoom; i > 0; i--) {
	    let digit = 0;
	    const mask = 1 << (i - 1);
	    if ((tileX & mask) !== 0) {
	      digit++;
	    }
	    if ((tileY & mask) !== 0) {
	      digit += 2;
	    }
	    quadKey.push(digit);
	  }
	  return quadKey;
	}

	function toCoordinates(tile) {
	  const n = Math.pow(2, tile.z);
	  const lon = (tile.x / n) * 360 - 180;
	  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * tile.y) / n)));
	  const lat = (latRad / Math.PI) * 180;
	  return { lat, lon };
	}

	const CanvasLayer = L.GridLayer.extend({
	  createTile: function(coord) {
	    const size = this.getTileSize();

	    const tile = L.DomUtil.create("canvas", "leaflet-tile");
	    tile.width = size.x;
	    tile.height = size.y;

	    const coordinates = toCoordinates(coord);
	    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
	    const lat = coordinates.lat.toPrecision(6);
	    const lon = coordinates.lon.toPrecision(6);
	    const gcsPromise = lookup$1(quadKey);

	    const ctx = tile.getContext("2d");

	    gcsPromise.then(gcs => {
	      ctx.strokeStyle = gcs.cache == "hit" ? "green" : "red";
	      ctx.lineWidth = 2;
	      ctx.strokeRect(0, 0, size.x, size.y);
	      ctx.font = "16pt Arial";
	      const lineHeight = 20;
	      let y = 20;

	      const print = s => {
	        ctx.fillText(s, 10, y);
	        y += lineHeight;
	      };

	      ctx.fillStyle = "black";
	      print(`x: ${coord.x} y: ${coord.y} z: ${coord.z}`);
	      print(`size: ${size.x} x ${size.y}`);
	      print(`lat: ${lat} lon: ${lon}`);
	      print(`quad: ${quadKey}`);
	      print(`res: ${gcs.length}`);
	      print(`cache: ${gcs.cache}`);
	    });

	    return tile;
	  }
	});

	function create$1() {
	  return new CanvasLayer();
	}

	const CanvasLayer$1 = L.GridLayer.extend({
	  createTile: function(coord) {
	    const size = this.getTileSize();

	    const tile = L.DomUtil.create("canvas", "leaflet-tile");
	    tile.width = size.x;
	    tile.height = size.y;

	    const coordinates = toCoordinates(coord);
	    const coordinatesLowerRight = toCoordinates({
	      x: coord.x + 1,
	      y: coord.y + 1,
	      z: coord.z
	    });
	    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
	    const gcsPromise = lookup$1(quadKey);

	    const ctx = tile.getContext("2d");

	    gcsPromise.then(gcs => {
	      for (const gc of gcs) {
	        if (!gc.parsed) {
	          continue;
	        }

	        const position = {
	          x:
	            ((Math.sign(coordinates.lon) * (gc.parsed.lon - coordinates.lon)) /
	              Math.abs(coordinates.lon - coordinatesLowerRight.lon)) *
	            size.x,
	          y:
	            ((coordinates.lat - gc.parsed.lat) /
	              Math.abs(coordinates.lat - coordinatesLowerRight.lat)) *
	            size.y
	        };

	        if (
	          position.x < 0 ||
	          position.x > size.x ||
	          position.y < 0 ||
	          position.y > size.y
	        ) {
	          continue;
	        }

	        const ageInDays = computeAgeInDays(gc);
	        let color = ageToColor(ageInDays);
	        ctx.beginPath();
	        ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
	        ctx.strokeStyle = "white";
	        ctx.fillStyle = color;
	        ctx.lineWidth = 0;
	        ctx.fill();
	        ctx.stroke();
	      }
	    });

	    return tile;
	  }
	});

	function computeAgeInDays(gc) {
	  return Math.max(
	    0,
	    Math.min(
	      255,
	      Math.floor((Date.now() - Date.parse(gc.api_date)) / (1000 * 60 * 60 * 24))
	    )
	  );
	}

	function ageToColor(ageInDays) {
	  const perc = 100 - 100 * Math.min(1, ageInDays / 90);
	  let r,
	    g,
	    b = 0;
	  if (perc < 50) {
	    r = 255;
	    g = Math.round(5.1 * perc);
	  } else {
	    g = 255;
	    r = Math.round(510 - 5.1 * perc);
	  }
	  const h = r * 0x10000 + g * 0x100 + b * 0x1;
	  return "#" + ("000000" + h.toString(16)).slice(-6);
	}

	function create$2() {
	  return new CanvasLayer$1();
	}

	const debug$3 = browser("gc:map:layer:gc:canvas-tile");

	class CanvasTile {
	  constructor(layer, coord) {
	    this.layer = layer;
	    this.coordinates = toCoordinates(coord);
	    this.coordinatesLowerRight = toCoordinates({
	      x: coord.x + 1,
	      y: coord.y + 1,
	      z: coord.z
	    });
	    this.zoom = coord.z;
	    this.quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
	    this.size = layer.getTileSize();
	    this.canvas = this.createCanvasElement();
	    this.canvas.addEventListener("click", this.onClick.bind(this));
	    this.clickMap = [];
	    this.gcs = this.loadGeocaches();
	  }

	  async loadGeocaches() {
	    return lookup$1(this.quadKey);
	  }

	  createCanvasElement() {
	    const tile = L.DomUtil.create("canvas", "leaflet-tile");
	    tile.width = this.size.x;
	    tile.height = this.size.y;
	    return tile;
	  }

	  getPosition(lat, lon) {
	    return {
	      x:
	        ((lon - this.coordinates.lon) /
	          Math.abs(this.coordinates.lon - this.coordinatesLowerRight.lon)) *
	        this.size.x,
	      y:
	        ((this.coordinates.lat - lat) /
	          Math.abs(this.coordinates.lat - this.coordinatesLowerRight.lat)) *
	        this.size.y
	    };
	  }

	  async render() {
	    this.renderGeocaches(await this.gcs);
	  }

	  renderGeocaches(gcs) {
	    for (const gc of gcs) {
	      if (this.shouldRender(gc)) {
	        this.pushClickMap(gc);
	        const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
	        this.renderGeocache(gc, position);
	      }
	    }
	  }

	  shouldRender(gc) {
	    if (!gc.parsed) {
	      console.log(gc);
	      return false;
	    }

	    if (this.isFiltered(gc)) {
	      return false;
	    }

	    const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
	    if (
	      position.x < 0 ||
	      position.x > this.size.x ||
	      position.y < 0 ||
	      position.y > this.size.y
	    ) {
	      return false;
	    }
	    return true;
	  }

	  pushClickMap(gc) {
	    const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
	    this.clickMap.push({ position, gc });
	  }

	  isFiltered(gc) {
	    return !state.map.filter.types[gc.parsed.type];
	  }

	  onClick(e) {
	    const diff = ({ position }, e) =>
	      (position.x - e.offsetX) ** 2 + (position.y - e.offsetY) ** 2;
	    let sorted = this.clickMap.sort((a, b) => diff(a, e) - diff(b, e));
	    if (sorted.length > 0 && diff(sorted[0], e) < 400) {
	      debug$3("Click on geocache %o", sorted[0].gc);
	      state.map.details.gc = sorted[0].gc;
	      state.map.details.open = true;
	    } else {
	      //state.map.details.gc = null;
	      state.map.details.open = false;
	    }
	    mithril.redraw();
	  }
	}

	class DotCanvasTile extends CanvasTile {
	  renderGeocache(gc, position) {
	    const ctx = this.canvas.getContext("2d");
	    ctx.globalAlpha =
	      this.zoom == 0
	        ? 0.0001
	        : this.zoom < 12
	          ? 0.01 * ((this.zoom * this.zoom * this.zoom) / 30)
	          : 1;
	    ctx.beginPath();
	    ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
	    ctx.strokeStyle = "white";
	    ctx.fillStyle = this.lookupColor(gc);
	    ctx.lineWidth = 0;
	    ctx.fill();
	    ctx.stroke();
	    ctx.globalAlpha = 1;
	  }

	  lookupColor(gc) {
	    switch (gc.parsed.type) {
	      case "traditional":
	        return "#02874d";
	      case "multi":
	        return "#e98300";
	      case "mystery":
	        return "#0052f8";
	      case "letterbox":
	        return "#123a8c";
	      case "earth":
	        return "#205910";
	      case "virtual":
	      case "webcam":
	        return "#009bbb";
	      case "wherigo":
	        return "#7196ba";
	      case "cito":
	        return "#029f4c";
	      case "event":
	        return "#90040b";
	      default:
	        return "#ffffff";
	    }
	  }
	}

	function lookup$2(gc) {
	  let type = gc.parsed ? gc.parsed.type : gc;
	  return lut[type] || lut.fallback;
	}

	function img(data) {
	  let image = new Image();
	  image.src = data;
	  return image;
	}

	const lut = {
	  traditional: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyRJREFUSA21Vk1IVFEU/t5zMguHyo05mWTmT5aBEWhmpkRBCJr2szJMyU1E0KLINtGiDAukFrVQqMDahJbiWIsgg0ItlUIUU6cMdJRCpUZLTZ3O93xvmJf/lge+d9+de+733Z9zzhsFc5jb7Q6W4XRBqiBMYBPQnAKHwC6oUBSlW9qFmxDbBMWCccF8Rh/6GuImIcXUk444pklTKrCOT07gaXsdKjrq0NDbCefQgOZu8w/ArqAtSA+Px+GIeFhUH/7uEmTJbio1J/1hEhDys/J7kUAl8YWX9+AY7PX2n/Yeti4IhSk5mpAMTgrOichtw9EjoK/8iRtuNb/mAW7UlRs+C2rPx2eiIDkbChSKZBg70QT082uTAevFmvuLJjdWQJHrySfZ5XFFiYhTZU/sisDKY1nsyrXZ+oNzyUEuATmhyOoZil1yoT7RxafnPXNOmst4J615d3jxE+K3ySIPxrkPlWe6UFVRERu4GftCtmPvxm1IDI5GwCou0GyVHfXIKLuqcZDraNQehlY6BZhEWiiypcXZIpESEoMkIU3YEAXrytVTAzM8B0eG8H1kGFWdbz2jDGsRYD+VAsxQLc7Z0t6cKIRc0FRnhufo+G/YHe/wsKUG9s4G3Nyfix5Xv8eTOaNbGAW0DDSSiAOvu1vRNzwo2+3T/aaag6GxeNH1HgW1j/Fj9KdpzLvjxWWjwDT78PUznjsa8exTo2nM39cPNV+ap5GHrgnE0NiIydfoMExZuMD0X4z5WXyRu+MAmnJuQZITDX2eY/HmcnIHrIoRrC3tAz2ahoSuUV9MmitUC0LXBmql4fjWRFTLLrOritD8rcvkRy7dHBRgyT3EwvWo5ZX2e73zI/ITjmHneo8jfFQVmZG7kSSherepGjElZ+Aa+6XzmBty6WafNdHSw+OmxXtbfzdqe1hRZre/E02LRTmSYplyiglypPza7LMXMFKWecmorCUS6nlGLbosc12s7SxYSzXOJQe5BOSEJsCqJ+9ZgkmW3KWIcA7nkoNcOqeUby+To1q+D46hIyJp8l4q+C+fTIPX1IrI8n30vZVEiN+Kf/rb8gdVeKo0WqOvdwAAAABJRU5ErkJggg=="
	  ),

	  multi: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA05JREFUSA21Vl1IFFEU/mZm19ltd3XbfrDNpBD/khDLlwh6MYIwMgOJwKfol0DowegtfIsMg14srLeohyC1ECoQiaCUEnoQ/AEj0RSrXdJ13d+Z7Zy7M9uubv6RB765c/ee850759xz7kpYQRKJRAEt1xFqCUUEL4FlmjBO6CF0S5I0RePahYi9hA5CnLCasA7rms4zHEkZM5qQ4ikanhBc0GOIjHYJxGc+Qw/wxgHZ5YVlVzXU0tMCkK38c4DQSF/zkiemZDgg8iZauEeQo6OdWOhtRtzPkfi3WDxFcNa0Iqe0npV0wnVyct+0SDkwdt5JOnKw9yaCH1tNnTWNjsPNcNTcJl2ZndSbXyIcGPEboQVXsPfGusnNHSSd3OEph6uMnEzLxmILjS4Oy3p3btiLgW2Zg7kIzAmJds9H8RslVPE/KM8ac9m1G4qnmFACJbcA+qIP+sJMChq9IxZkPnBOPFeGKVJWjaZ7LfTgc67waVmaUOu+Y3A3dEHKcZDKyhL3jcHfXio4mEstb1DIoo4dcBGJo8hjusQmP0ALTGHhTRMkmweyfevfUc1DIhqANj9Fuy6GHplLmRoOeF7LOeAKBZ/zZRJfhP/hAQrFLCSLCtnphWTdgkQ8Aj34Q5CHBtoQ+z6ARITzmpQ0riL+AlGBZhGxiq3yPKx7jsCSXwXLjgpISk7S0nhqc5OUh59E3A/ZkU9Fdyhjg2lcXnawTGwV5yCpLmi/hgUkNReWnZVY7L+L6Ne30HwjsFVdgmxzQy2rp/kowkPPlvHwD+yA67+Ey1+nRLFEJ/ooBLMIf3ks5oqnFM7jbQh9ShUolLxCcZpCg+1CJ/3BXIaIOhC9gHvLaiLZt8N28DLcjX1Q959FdPx1VpM0rnH+Am65J7hxhYeeCgM95INafJISNy/mHGNr4VFsuzqCyFg3gu9bEJt4R2sJsb70wVyG9GQtNMnqhL36GiS7x9BLUBIHifwVoIVN46zj0kIze1EHaV/gMv/9/ExWw7X+6G54YXbWR9SLLpq96BYRBLjlcsPaqLCt0ba5KJgTwgF3PXpvJOjccjfiJNlJuV2LO4EvHuaECBG/sGzqhZN08f+vTJM3Y+QLiLA5l366J+Ou4Ha+4b8tfwAYN9CSZmxGFAAAAABJRU5ErkJggg=="
	  ),
	  wherigo: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABCRJREFUSA21Vn9M1GUY/9wP7uTgDjuDU4RFQhOZFrRUWkDTVdNYITmdm6hz6cqaZnNtbuXUP6zcWlnWarPlNH+0VWNQYI65SYk/cP6amKCeEOIFivwShOPuuJ7Py/f79U7C2spne77v+z7vc8/nfZ9f75lwHwqHwymyXSRcKJwunCxM8gl7hSuEy0wmU4uM/57EcLLwDuGg8D8Rdairg0cBmaJWshDFl2XYI+wMhoZQceIKKoXPetvQ2tGr1Me745Gd7sGLMzNQKGy1mCm/LVwitylXStonCkCMrxH5J8JmGt64qxqNf3ZF6o+YPzphLDYve1YByeaQ8NsC8pmuaABoJy8Nh2He/O2v2F56UtdRY6zNitysFPjae+B5KB7nrrahu89v6Kwuno6NSwpgMimQYv0mCkDzX71oOzftvmvcZrVgfn4mXnvpSVSduoqHXQ5cbG7HBytm05UoP3oJW787ioaWDgVEkE1LCzinuzIFxKcD7BDBCrpl6YdlVEBqogv73y1GQrwdP1RfhMthR0aKW04fB+/1DnT2+pGT4UFl7RVUn2vGkbpr6ne71xfp7vpaAFaa5CRMxSYJqCV39U7lcxo79NFiNLV2obbBh7WvzMQYcdG99PsfN7Htx1okjXXgy59Oq23G5Pj25Qx8SARpDD/z3MLT6wHdUJIHZlBpTQPWL3rmb43TWtYjidhQko/yY5e5VEQbtCVkES4iAItIpSJHZ6wNVacbserTA9iyfBZFI2hgMIiu3gElT01y4Z2FuZicOs7QY1prVEgAVqjKc44WyemkBAemyulccXaKDPL6OvHezsOY8eY3zBaD5uVlIklioxNrRqN0OlZVoF5Ec6ZPwlOTJ+BWT7+upMbXt1Xiewk26dW52UiIG6Pm/PDWgUAQZrPk6FDYKEjZSlYlaGjKJBAcQqw9Bv3+YKQY6xbkYrx2ypWFOVF7XLR19sHtvAuqKxCAjQssf9IlyenHJrpRW6/ESsYPZT9vWYRlLzyu5saGTOqv3YItxmrcWrclWz4CsCuq3sLxfOMN9A0EcKL+upHblJOYgh+ven54EfHdur8GMzKTpfiGhexTGnkJwJarGpcmxFtfHMSCgil4QzKp455Y6Dr6uPdQnUqQ9u47uijSVgUBWLohdkWekNTU1o3mGz2YlZ2GvLW7jBRWm9rndv8g1n1VhTWfH8TsnDT8clI5QtmgLSEWWtmorSLGalbu8A+G8P6+Ggm8FU9M8sDjjsOFppuoE1fapbqnpiXit/PDbYJWR7QKCkdrdtzLn5aKJc9Nk1ZwCncks57Omohxrlj4AyGcudyKmgstVFM0arPjroDwoRm1XfNRsUieOx02tHdH1wh/f992TQWSgDy4B2cYwrjJHln/L0+mbjdqZEyEH8yjH4kkIHwr/tPflr8AyeMZQ/ZJr7AAAAAASUVORK5CYII="
	  ),

	  event: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAslJREFUSA21VktrU0EUPvemXWnQldUYfDTYpuKipIqbijtBqg1FqbZNKLgUFAVBfC181CIKlgouFCzSgriStAb8AV0I2tCFj6IkuIiRisWKihjTxO+bzoTctHmhPfDl3Jk59/vmdc6NJWUsl8t5MRwEOgAf4AFoKSAORIGIZVlJ+OoNxB7gPpABKhljGGvEHUKWo4UGAjvhxgB3NpOReGRCEpGnMjsVk5+pTyp8lWeDNLQFpDF4QHzBg2LX1bH/OxDCasZVkP5xCID8JPpvAzaJJ89ekPl4ojB+yfNaX6O03xhQQhjMAqchMmwC8wJ65k+wBHvy/CWZujVkYqrybWdOSfv1qyKWRZEusxIloPdvBgPuyXMXayY3M1Aig9fY5Hb5IZKy9eBleDe3pdaZ6/eV47vkIBdATrEwe17FDzhQ1+iOQH7PG3YGpPXEcS6ZcaUtl5PpO3dl9mVMxfBMwq9iPPgFdGzh8fOeu6hceKDNPUfE33tUvVTp59eXubwAOci17VCXi9zcIiaRuor0xrB/5rGiL47ltdbWwRUwQ9U9150O9zk2LW8ejjr6TGN7f1jWBVpNM++ZM9p8FFAZaJLIjBjv3uSVpu7Dpqm8XV8vxJqtmx39plHA5aFAWZt7/VZeDN50xLT094kfZ1SNUYCFq4npn373fsk73r17hKjFyKVN5QGroqotppd+If2nsFn2uTiWdUpbnCtgyd3PwjXz6LEZkNjQsHxLJMSyTS4uDrWEemX97l2YQFqeXxmQ31/nJT6evzUqiFzaoiUTzUQU+30P7klzT7dEu/skMcG5Oa040Wzc4SRCRlhyWRUrGUv4s/CxZcn5Ljl0+R4ht8qmWordau9G+ZH8uOw8ShY7KPEmhYAsSy4DS1lZcpbrxW8CPzzkFEc9wEpW7oNDNRpEOuHGgP/yySTnEuOZACvz0S9Ug8g//235C/adi9klrFIeAAAAAElFTkSuQmCC"
	  ),
	  mystery: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAz5JREFUSA21Vk1IVFEUPm/Gf53MSqzJKFPQosCNWCS6TiGZqCCwojJaabRsEf5A7aJSbBMhpraQcjAaF0ELs8h0kYSIkFNiMmlUpo6lqTN93/W94c04o0J54Jtz37nnfee9c+45bzRZRfx+fzq2S4ESIBOwAxQP4AZcQIemaWPQ6xcQ24H7wCKwltCHvkbwoEBa0BUu4HgMqgWwLS75xPV2WDqBfveEjP/wKvftW5IkNzNNivOzpASIslponwHK8DZPlZP+ExQA5JWw3wYsJK5q6pJPX36a/VesM3ZslppzRSoQNn3AVQSpMxwDAfQnd/r9Yqlpfin1zj7DZ126wpEnVWcKRdNUEIfxJiqAnr8hMNmqH4Yn352WLKnJCfJrfkFGJ6bEO7ewIjCDVJ8tpJ3pykEQT5TuVQNtY1pCn5y5brhyVHJ2bdVdkQefX94MjqkUvhueCNh5b162nemywUjOSxqenkdxBAW1HqpoDMp5Wkqi9N27KBa855PuIfmIehzMSBVHQY4inZ6dl8O4Z3xyVl3zhzXpqT/Pwi/hcg/Lz3Nu5dOHFvRU0X5JjIuWKRC9Gvgsd9t7pfyWS9oRjLIpMVZOwscs5CAXxAqUMgCbSB1FarNYrapEwmNZifwaMumdM5YSF0OeYOGx1qWENWCHqnOuGwPqQWe/JMRGy4E9qdL0/L2yZ9lTxHEkW63ZF60vBgL+xoI9o0smA6gONJrI2KGe+f1Hbj56HTDl79sprddKJcUWLz0o8uU7neL5vtx8AScsTFx24xSZ98Ou96J4bdePS3xMlNQ2d0udsxddH9Y1yMgacHCpPAfthFw4CrIlKT5Galu6VbFXI2fNdPEwAKeimi26MazyfPOK2zMpz3o+hN03G9k7urgZgCNXDS7dGFa1dQ3K6RtOGRmfCrtvNnII6uJigA5giVORTRJJHledkN6GC1JenBvJRdnJQS4IG63DgnkxhkUjRy6nYiTh6KYYOpIfOfTx3Uhu1UnrGXYWzIv0bTYZ/TodiVvCDTumCCNW40kqA3wcuXQMFQ64tch5LzkAfnjU6VyeBTob3mTjPjh6jP/+yTR4gzRrAmzMR98cCUH4rfinvy1/Af7csynEN+GQAAAAAElFTkSuQmCC"
	  ),

	  earth: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABLlJREFUSA21VltsVFUUXffReXamFEqtY+lDdFqiFIw2WIzVaEJFDP3AL8VIjQqJiVrxw4QPI+CHhtgYf4xEMEo0YhCqbUwUUokYFYygRUtLW+lraqdMh85tp3dm7sO9zzzSsVD4cU/2PWc/7tr37LPPPiNhEbJtu5zMzcSbiFcSB4iZQsQDxJ3E7ZIkjdJ440TAAeL9xAbx9Yh92DcbPC+QlCeRQI6baThE7LNsG+MzOoa1OUzpSVT6Paj1RqFHf4XiLIWjMEjjTVkIjSZbaTVfZRU8yvMFAn+R5KPEvpM9Z9C0awO+G5pAX1TDlUQKVa5pWIYGQw8hMX0O2thhzISOwEpGGMbH72YwWBaUC5D58jbSynsO70PL3kcwOHyWVmQJxxU+N6TZ32mJKWIz/TY9OZg29jlSs32sY7y2DBbL6RWQgvPHaZHbOvbjwLE3BbBlmRj/5wL7oaJQhRG/BCnShaKLO+Edex+KPiJsNgWMh7+lIP0sc5BDGcxcit4gpe949ym899lr7JSjubmomBfLUcjxQcjuCpiBbQK8cKQNjis/CDsBIj55glI4zTKnizEhk4FLsYWFfYfTX85zpkJvCcoDa+BQZDjNCaj6EJTlG6HWfQjpvt9gOW6BZ+ILFMTOCH/bSkKf+knM6dHC2CpNuM6V490/onfgZzSsewpF/jJKTQ/uX/8MXG4fil0OmIkwVNlBnl4BIHlug7z+FKyTq+AOH4HhrYGt+EWabCoESfUpjM0B+BCh85cOyLKCBxt3wOlIg7CeaYmzQFSPpDjTisxTcpbDrG6F2r8Hzuj30Es2c5kjFf8bDn8de23iDeETioHxPtxV17wAnG1uVaHCiUOi339JqXgeNinV2XQxsN2g1WZoJa9AnMCy0hqsu3db1pA3OhUJlqlD8lTl6e3EKMxwBxDcS0EUuIrrYaWikCSGFRTIzZoeegEzSSNryBsVWCjwVsO63AuzawUIAVJKgy3JsFyVSPrvhlF4J2TtTwrSgL+mJKwtSUNwAG5cQQ+l4VoBaHNQQOUZd9fQgdgJOrpUf7ThEu8j7btjKVzeWxFVgth97AOEJy/i41cOsCnEAbgrBpe5nQjHE6xcQMMxHaq/At5lW+CSE5CtFAxKQxIuxAwvIkkLI5NxzKZmcL7/NBpXN2YxBjgAt9yN3Ap6IrGsIW8cpWbHnCauC6c46ZcjvSgqKoOjwCNMhpHA8OhZPL79nYwvOjlAO/G7N3tdylKqd+6aN0KffLoDg5dOQ1FUBG9/AHV3PIrR0B+ora5HMFDNENyw2lW+LKh2D5Lw7D1lxdQ9w6KW2WMxmo5NCLNpGui5cEKwqjrx5e6u7GsHGZvXy/Q6sUarwNrlRUKx2EPXNcS0dID5fq8++RZWV61iFd8NjJludhSJK2krsVVHAdaULmHbNSkyNYRUSs/ZJSrXl594G9ubnmYd93e+eBgz102ptMVN1MoOvIqHK0vhpxZxNcreEWwrL6vFR7u+wUuPPccig7dmsFheePZpP3JXpk0OI1ocQzG6MucSiBsmfwjOd3+NUOgcmhu2oLl+gwCix1WvzKwxb6Qg/9+lPz8SBeK7gts5d1xuiqJv0cj55QN63b8t/wKr2TSEkL8YwgAAAABJRU5ErkJggg=="
	  ),
	  virtual: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAA0NJREFUSA21Vk1IVFEUPu/NOJbNqIV/jZHWqCQxBSJaWQRBKyk1CCQiWtQ2LDLctYvIhdCiCAU3QUmQjukmo62lEf0stHRMBxtKxyInLZ2/znfn3ed7M6MJ5QfnnffOPXO++84597xRaA3EYrEdvFzHUsviYnGyAH4WL0s/i0dRlGnW6wcHdrK0s4RZ/gb4wFeSm4gU0xM/sONJVvdZHKFYjHomZ6lnaoZezQbJv7gk3J0Z6VSZ66D6ojyqL86lNEWECfLiWX6bXuGkXUwEHPwS29tY1O6pWWp+OUbe+UWjf9K9KzODWqtLqaEoF2tRlstMcls66gTazrvZQ20ZGqfWd5PSZ126eV8x3awqITVO0iDfRBBo+RvlSI5rqwS3qQrt3Wonu9VCb74FKRiKJBGD5BaTMJCuPUzilwTtbLiAtJwaeAsHE44WZFPXMTflc+6BUDRKTYMf6c5IcvM8Pr5fpquDCS4qvHu04iQX1FL+aDAp59jxp8YaytlkE8GNl6qeIRoOzBtNhJqMnD6IwuMVizllos8t6JZUBT2xM0cEj0RjeqAwvwFwvmy7bpM3iIFYDAtLHQhwiEQrQieiJCtDmJpefKCO0c808n2Bqj3DwobdpgLaWkOtlW9wQkWfa0ah2g6UUZh3bU/DRoh2OTZT4ZZ0yrRZyL3NLmxI341KF9lUla4OjQkbLjgzGlwgECdQHiK5ksc5P1NSQMuReDquuIvIv7BEVu6mjiPlwu1QfhbVcAM88H6RPxPaEMuJFKXEw4n4j2yWFZdn/jm6y51j5R0D3CVCd3m/Cp3qAk8MLsLxN6LPF6A+nyiWbj5X6qTrFbv1Z9w84dbuTfAzxPKDAFNRzBZoCfRM4/P35Pv5W5pS6pbhcVrpr7gL5pQGLwgwcsXg0oy6WghHudDxGujGhJuKHD2YvoIhqKEfBB6WCKZiYttl26yie6R3Kn04P9tkRgzEYuCgeVQuFM57J0YupqIRhVyXmV/L9HR6ju5xcX8sh8UyNJ4H2B4yHEAsIoY2vjsRW84itOqaww4/zkqzUnVeJr0OBCmwFILJhFWHHbw2dFzLbTDJxn1wDCT/9ZMp45o0PkAsG/PRNzIxyT//bfkDTJyz9hfnUiMAAAAASUVORK5CYII="
	  ),
	  letterbox: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAsVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////8SUIz///9hirL6/P0yaJzf6PB9n8DH1uQdWJHx9fjQ3Oi2yduzx9qxxdmvxNiiutKCosJnjrVljbRZha83a541a5709/rj6vFzl7tTgKzw9Pi/0OB1mr1NfKkcWJHm7PPR3emUsMuQrcmMqsdGdqUfWpImJ7m/AAAAFXRSTlMA/PMct9hubGpOGJyZUErb2aqinpGnsTdfAAABDUlEQVQoz32S53aDMAyFLQMhq+nMxQkhDSNsyOp+/werID6U9LT5flm6tiRLEhrDNi0pLdM2RB9jStDQfU+6kVBhkp9OeRIqyJHQDAj+Yq5Z+KCBvk/Knfdwido3hgT7+2whxyw8wp//YoMJPyDVxe/yKDLEACEfP5Ytz0zEZoChMJHwqa4KtKh3h80YprhFE2m1qvdglmm0ZjOHJSS8RkBRHQp6S1/QCB5kJ6yrw7F2nbIVvli4Q94I+/QVuxKlE+3YzGDp5Metwpko1cntttzM6fjU5f77QTH5qyXTa00UMyL3ws9t7wa1+RnUBmQLzUhCBXHmeVkcKMiZ6Bg/ETT0ML7ck+F5fYaGdnwDfRwpPOAsNlkAAAAASUVORK5CYII="
	  ),
	  cito: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABFpJREFUSA21Vg9MlVUU/33fe0/+vefTB0/iC3Tgy8SicCNfgsRaZZtA5NpabbSknDVEq+VcWxvVrK1s5MbaUiqp2UAbDV6Bttx0mtELtZBaKOsZxZ8FYoTg+Of3bufc974PHzysrXXeznfPPffcc+4595xzn4IbgBAilZZLCAsJlxNqhAz9hAHCFkKfoii9NP57IMUa4fuE1wj/CViGZQ3jEYaUiBlNSPAhGj4hdASFwPHvL+DTU23wD17A4MQIrFYVKTEurM/IxuMFXtyWnmKoGCWilLz53GDwGGGAlG8n3h5C9avTP+PZuv34zd1NgZkk1izQad4TiwIlBzWbn4LnZjcLBAlfICPVPGEwDYRP3ihI+cv7P8NbFw8BnvGQ1OzvL3EQv8YCoxbyU0eCiMfB7VtReHcWS7KRjYYn0kA4fudpwbGzpgFVw3VA8jQLRwJtFUddED0xkq8lOtF/eUTSFouKL6uew/05mTzncK0kI/2qXAVeo9HhO3UOVb108mjKSUCcdZjKi3Kz0Pz2NlQ8cq9UoetBPFpZYxh0EJN1QqXTcyqWTes6yg99CGRMMH8uCHK2M8Hk52V5kF++G6XrvUhy2iV/+MpVVH7gM2TKWDd7wHluaTrZjj+0PmNx7jhsgZgiIwSvlBXh9PluXJ2YwoYd1di0IdeU/+hwK4ZGxnhOF4QSNsBFhPpWP5AyxWR0iOW7A+xxMeDTN574ARZVwdj4JLJvSUOGliTXOVTNrT9Kmj6FbIArFG0DXTzMD3FBKHYd09d0dPUM4IvdFdhcnI8jdLHMGxmbybgz5F0YlluJkBV4ORjKBmPlSc996PizG64YO7R4F+ounoC+ZhSTxyyo2FNviGGf76RJG0T/0F8GqbEHEpSgScq5Z6EGr/tWrHSmYu2STOiCQpQxDiX5BmEM61KVGV3sATeuFYk2BxGXwiLArvZ6fFf0DtyxTtzeVG7ylbtGIZoTzXk0IiXJabBlHXBXRN5NqwymHB/QVoN7UdPvfuzNraCSD2UQ3FEKMGIn4F2VbnAC7Au3XDy2zgv0hSqU52/mbMLzbTXY5t+LTGcaitPWMJsqh/oLJ+A8YLNaUbhWtgyWaGEDXBl6cd6dWDqwjJlYmuBGuj0Z3wx2QtDvpTO1cC6Il2u4ZIPgRjcPbCnJx2KHlGUpn0r9gh+LWs7pfU88LavVQpe01f8ehSiU+0f6zuJA4LhUKTpmqnm2jSWLF6KSijAMtaxbBvb6ZrfrQAte7fyYrn0mr0Oa6dtuR5D6UTRYYLPiWPWLVISyrMxmF74586FppM1q1cGj2HmY3hyN+hIVF65YIbqoRQ/ZoulG0iIHGl5/BgXZK3id3Y5s18Yu8sR8cFp/CmDHuw34lsb5QFVVlD7oxRtbNiLVvYjFWHn0B8dQQkbMJ5N53NR8X59DR6AXXKExNhs0yvN1d3jw8D2rsSzZZWzlsMx5Mo3FiJHvhPD/efSvt0RG/vPflr8BtbrUuI+fyWoAAAAASUVORK5CYII="
	  ),
	  webcam: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAyRJREFUSA21VktIVFEY/sfRfIAa2ow4WY75yoosksQgF4ErwUeUK6PosSikaKFEiyAqiFwEQQWZ0EJoEaQTSfTatEgKKzLI0bLGtFnMKKSWj9Fx+r7j3OneO2RPP/g89/7nu/839z/n/FeLLIJQKJSF6WqwEswFHSDhBQfATtBlsViGMf4+kNgBtoBz4K9ADbWaucHIYrjDDYRVGNrA5NlQSDo8fukY9Em3f0K8kzNK7kiKlxJbstRk26XGaZM4i0ozgcl6vM0dJQr/MRgg+VHEL4Ix7YN+aXz2TgbGJ/X6qOvclCRpLs2X2mwb5+bB4zC5pAkjBuFf3g5FzInn76W5x6Npfmts3OiU81vzJGbBpFZ7E2UQrp8bmZKb/iK59gtocgEmAMu1FiZezaAFgYMsy86HrykwwJ4QJ/sKHLJlRYqKvxgZlxv9XvFNzxp0vLldUayV6zoMDlnw67kVPVhQa9GtrqiaV6+2SWt5kaQnLDMkG50OyIEnveL65DfEuSa9u8u48EFMOFEytc+t3C3mBS1MTZKbOzao5IHgvNwfHlWcwTUNOUeNHszBXIAVrKYBD5Haihz1OFeSK4mxVhkPzMn2u91yb2hEHsCkHNdjiHGOGjO4rcOojMWFUnCfm1FmX65CV3uHZU9epjSsX6XuW/s+y+W3Q3JyU45oGv2zuly5fAN1ArVDpAk5YUuMU7e+qYDk60qRjzozRlBDrR66XA7zXETHE9P3ZeGQ1a3JkLOvPopnYkqGvk7L6ZcfhDHCDQ21PwMN2LiEx9+MKygNUWpPlVObc+RYV580PHVLU7FTtmX8KJ/5OV0uL9eAXbGAvaV/7JtBe809LBUr06TWaZeKrHRFvaDd4xNqzGCuMAb4Bmy5qnGFg5EhGBKpe/xGzqAkZjDGOWrMYBMMo5MGLjDIrshDYsbe/Ew5vI5n0YgjiO0vjO7QzMFcAA+aa9FWkRYfKx04+oth16MeQ8uIahV8eCmbndqm7HrwqQfn2XLZFf8UWrtmDpAfHrU7I98DJsSbLN0HhwYETKowtIH/5ZPJnFHgmoBL89HXu8Hkn/9t+Q5Pu7owGb2pIwAAAABJRU5ErkJggg=="
	  ),
	  fallback: img(
	    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACT1BMVEX/////AP+AgICqVaqAQICZZpmAVYCSSZKAYICZTYCLXYuVVYCJTomSW4CIVYiPUICHWoeUUYaSVYaLUYCQWYWKVYCPUoWOVYSSUoCNWISRVYCMUoSPWICLVYOPU4CRU4OQVYOMU4CPV4OOU4KRUYCOVYKQU4CNU4KMVYKOU4SQUoKOVYSQU4KNUoSNVISPUoKOVIKQUoSOVYKPVIONUoGPVYONVIGMVYGOVIOQU4GOVYONU4ONVIOOU4GNVYOOVIGPU4OPVYONVIGNVYGOVIKPU4GOVYKPVIGNU4KPVYGNVIKOU4GNVYKPU4KOVYGPVIKNU4GPVYKNVIOOVIKPU4OOVYKPVIONU4KOU4OOVIOPVIKNVIOOVIKNVYOOVIKPVIOOVYKPVIOOU4KNVIGOVIKPU4GOVIKPVIGOU4KPVIGNVIKPU4KOVIGOU4GNVIGOU4KNVIGOVIKPU4GOVIKPVIGOU4KOVIOOU4ONVIKOVIOPU4KOVIOPVIKOU4ONVIOOU4KNVIOOVIKPU4OOVYKOVIKOVIKNVYKOVIKOVIKOVYKOVIKOVIKNVYKPVIKOVYKOVIKOVIKOVYKOVIKOVIKNVYGPVIGOVYKOVIKOVYGOVIKOVIGNVYKOVIGPVIKOVYOOVIKOVYKNVYOOVIKOU4KOVIKOVIKOU4KOVIKOVIKPU4KOVIKOU4KOVIKOVIKOVIKOVIKPVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVIKOVILT/jDJAAAAxHRSTlMAAQIDBAUGBwgKCwwNDg8QERMVFhcYGRscHR4fICEiJScoKSssLS4xMzQ1Njc4Ojs9Pj9AQUJDRUZHSEpMTU5PUFRVV1hZWltcXV5fYGJjZGVmZ2prbG1ucXN0d3p7fH1+f4GCg4SFhoeIi42OkJKTlJWWl5iZmpydnp+goaKkpaanqKytrq+ws7W2t7i6u7y9vr/AwcPExsfIycrLzM3O0NPV1tfY2drb3N3f4OHj5OXm6Onq6+zt7/Dx8vP2+Pn6/P3+WK8WRgAAAmpJREFUeF5t0OlbjFEch/HvzFRTRkUCkuxaZKdE9j0FJDtCIHshO0REdiglkCDtUoMM9x/mOc9cSvi8OdfvOveLc37qFJyae/ttU+Pr6zsnufSv/gda6VC/rYe6Csr+RhctK/WnqHIA3/2cJakzM/ZV/AQoClWHoXVAW3Yf+SnmyHfgeaT8NLAeuGqPsfHxQ2UZUgpUemRzPwO2ydYMD2QEnQUuybYL2Col7uoM9sbIeRFYJMugdiiU1PPjjN9BxssQKbgS6qxTefA5QpYJDf38wZCWkbKM8kGW5PkCW+RwStp+12UCd2WmJJd0Dl5Is6E9QrG1Bya4AnLDTBC139r6qYZwjQGG6TCUSLuBxvzkgCdQEDL7ghdYLEctrNYj+wtV2E5Gxid0f4ztinQRjqsW5spzvg3jnCzPMBr2S9lQIi8kSXJPP9kCs2TZCB+tF0laA0/VBlNl8yQvCJQlND3RJVsWlKkGFkqKWF78wbH5Tow09lFa74a8ZNPuhGLdgxw5rnsLF4bNgy/j0ny0xw3eVNGyQyqEo8qFh9L4blJ0GzA/B6j2WNNEuZpgmaaBb4AsgY+Bu67Qd8AZGUnwc6Dcn2Cv5N9Vc79jGQnf7S1ZiqFU0h74Okga/QNI1akV2gB4I6UpQJqkXl64HyDH+nYOygTOm7TOkcLfwxv732uBfElxV4PtQH2KoqTgW0CKDGcJcCJIhgls4eb+kPx6VgFlw2WEuGVMfg/cDJKf+r4CfKfj5OdMuoa5D1GHsCKMmrNbVmVuv9yEcShQf0pvoovqFP3Fs66KDmVLA/QfI7IKbleU38hbHq1OvwC3dFhaLHVbewAAAABJRU5ErkJggg=="
	  )
	};

	class IconCanvasTile extends CanvasTile {
	  renderGeocache(gc, position) {
	    const image = lookup$2(gc);
	    const center = {
	      x:
	        Math.max(
	          image.width / 2,
	          Math.min(this.size.x - image.width / 2, position.x)
	        ) -
	        image.width / 2,
	      y:
	        Math.max(
	          image.height / 2,
	          Math.min(this.size.y - image.height / 2, position.y)
	        ) -
	        image.height / 2
	    };
	    const ctx = this.canvas.getContext("2d");
	    ctx.drawImage(image, center.x, center.y);
	  }
	}

	class ZoomedCanvasTile extends CanvasTile {
	  async loadGeocaches() {
	    return [];
	  }

	  async render() {
	    const ctx = this.canvas.getContext("2d");
	    ctx.font = "16pt Arial";
	    ctx.fillStyle = "black";
	    ctx.lineWidth = 1;
	    ctx.fillText("zoom in :-(", this.size.x / 2, this.size.y / 2);
	  }
	}

	let hack;
	function create$3() {
	  hack = new CanvasLayer$2();
	  return hack;
	}

	function toggleTypeFilter(type) {
	  if (state.map.filter.types[type]) {
	    state.map.filter.types[type] = false;
	  } else {
	    state.map.filter.types[type] = true;
	  }
	  save();
	  if (hack) {
	    hack.redraw();
	  }
	}

	function getTypeFilter(type) {
	  return state.map.filter.types[type];
	}

	const CanvasLayer$2 = L.GridLayer.extend({
	  createTile: function(coord, done) {
	    let tile;
	    if (coord.z < 11) {
	      tile = new ZoomedCanvasTile(this, coord);
	    } else if (coord.z < 13) {
	      tile = new DotCanvasTile(this, coord);
	    } else {
	      tile = new IconCanvasTile(this, coord);
	    }
	    tile
	      .render()
	      .then(() => done(null, tile.canvas))
	      .catch(err => done(err));
	    return tile.canvas;
	  }
	});

	const debug$4 = browser("gc:map:map");

	const layers = {
	  osm: create(),
	  debug: create$1(),
	  age: create$2(),
	  gc: create$3()
	};

	// leaflet will manage this object
	let map;

	const Map$1 = {
	  view: vnode => [mithril("#map"), vnode.children],
	  oncreate: vnode => init(vnode.dom)
	};

	/*
	var marker;

	function onLocationFound(e) {
	    marker.setLatLng([(e.latlng.lat),(e.latlng.lng)]);
	}

	function onLocationError(e) {
		debug(e.message);
	}
	*/

	function init(element) {
	  debug$4("Initializing map on %o", element);
	  map = L.map(element, { attributionControl: false, zoomControl: false });

	  map.on("moveend", () => {
	    state.map.center = map.getCenter();
	    state.map.zoom = map.getZoom();
	    save();
	  });

	  /*  map.locate();
	  map.on('locationfound', onLocationFound);
	  map.on('locationerror', onLocationError);
	  marker = L.circleMarker([0,0],{ radius: 5}).addTo(map);
	  
	  setInterval( function() {
		  map.locate();
	  },10000);
	*/

	  if (state.map.center && state.map.zoom) {
	    map.setView(state.map.center, state.map.zoom);
	  } else {
	    map.setView([51.3, 12.3], 13);
	  }

	  enableLayer("osm");
	  for (var layer of state.map.layers) {
	    enableLayer(layer);
	  }
	}

	function enableLayer(name) {
	  let l = layers[name];
	  if (!map.hasLayer(l)) {
	    map.addLayer(l);
	  }
	  if (state.map.layers.findIndex(x => x === name) === -1) {
	    state.map.layers.push(name);
	    save();
	  }
	}

	function disableLayer(name) {
	  let l = layers[name];
	  if (map.hasLayer(l)) {
	    map.removeLayer(l);
	  }
	  const idx = state.map.layers.findIndex(x => x === name);
	  if (idx >= 0) {
	    state.map.layers.splice(idx, 1);
	    save();
	  }
	}

	function getMap() {
	  return map;
	}

	const ProgressBar = {
	  view: () =>
	    mithril(
	      ".progress-bar.mdl-progress.mdl-js-progress.mdl-progress__indeterminate",
	      getInflightRequests() === 0 ? { style: "display:none" } : {}
	    )
	};

	function upgradeElement(vnode) {
	  if (typeof componentHandler === "undefined") {
	    return;
	  }
	  componentHandler.upgradeElement(vnode.dom);
	}

	function j(...args) {
	  return args.join(".");
	}

	var Button = {
	  view: vnode =>
	    mithril(
	      j(
	        "button",
	        "mdl-button",
	        "mdl-js-button",
	        "mdl-button--fab",
	        "mdl-button--mini-fab"
	      ),
	      vnode.attrs,
	      vnode.children
	    ),
	  oncreate: upgradeElement
	};

	const CloseButton = {
	  view: vnode =>
	    mithril(
	      "button.mdl-button.mdl-js-button.mdl-button--icon[style=float:right]",
	      vnode.attrs,
	      mithril("i.material-icons", "close")
	    ),
	  oncreate: upgradeElement
	};

	const debug$5 = browser("gc:map:sidebar:filter");

	function filterUser(e) {
	  e.preventDefault();
	  const input = e.target.querySelector("#sample1");
	  const username = input.value;
	  // use date for sorting later
	  state.map.filter.users[username] = new Date();
	  // TODO how to get the hint text back?!
	  //input.value = null;
	  document.querySelector("form").reset();
	  save();
	  getMap().eachLayer(l => l.redraw());
	}

	function unfilterUser(e, name) {
	  e.preventDefault();
	  delete state.map.filter.users[name];
	  save();
	  getMap().eachLayer(l => l.redraw());
	}

	const Filter = {
	  view: () => [
	    mithril("h1.sidebar__title", "Filter"),
	    mithril(".sidebar__subsection", [
	      mithril("form", { action: "#", onsubmit: filterUser }, [
	        mithril("h2.sidebar__subtitle", "Hide found geocaches"),
	        mithril(".mdl-textfield.mdl-js-textfield", [
	          mithril("input.mdl-textfield__input", {
	            type: "text",
	            id: "sample1"
	          }),
	          mithril("label.mdl-textfield__label", { for: "sample1" }, "Username...")
	        ]),
	        mithril(
	          "div",
	          Object.keys(state.map.filter.users).map(name =>
	            mithril(FoundFilterChip, { name })
	          )
	        )
	      ])
	    ]),
	    mithril(".sidebar__subsection", [
	      mithril("h2.sidebar__subtitle", "Minimum favpoint ratio"),
	      mithril("input.mdl-slider.mdl-js-slider[type=range]", {
	        min: 0,
	        max: 100,
	        onchange: e => debug$5(e),
	        oncreate: upgradeElement
	      })
	    ])
	  ]
	};

	const FoundFilterChip = {
	  view: vnode =>
	    mithril("span.sidebar-username.mdl-chip.mdl-chip--contact.mdl-chip--deletable", [
	      mithril("i.material-icons.mdl-chip__contact", "sentiment_very_satisfied"),
	      mithril("span.mdl-chip__text", vnode.attrs.name),
	      mithril(
	        "a.mdl-chip__action",
	        {
	          onclick: e => {
	            unfilterUser(e, vnode.attrs.name);
	          }
	        },
	        [mithril("i.material-icons", "cancel")]
	      )
	    ])
	};

	const debug$6 = browser("gc:map:filter");

	const Layers = {
	  view: () => [
	    mithril("h1.sidebar__title", "Layers"),
	    mithril("div", [
	      mithril(Checkbox, { layer: "gc" }, "Geocaches"),
	      mithril(Checkbox, { layer: "age" }, "Fetch age"),
	      mithril(Checkbox, { layer: "debug" }, "Debug")
	    ])
	  ]
	};

	const Checkbox = {
	  view: vnode =>
	    mithril(
	      "label.mdl-checkbox.mdl-js-checkbox.mdl-js-ripple-effect",
	      {
	        for: `toggle-layer-${vnode.attrs.layer}`
	      },
	      [
	        mithril("input.mdl-checkbox__input[type=checkbox]", {
	          id: `toggle-layer-${vnode.attrs.layer}`,
	          checked: state.map.layers.includes(vnode.attrs.layer) ? "yes" : "",
	          oninput: e => {
	            e.preventDefault();
	            debug$6(e);
	            if (e.target.checked) {
	              enableLayer(vnode.attrs.layer);
	            } else {
	              disableLayer(vnode.attrs.layer);
	            }
	          }
	        }),
	        mithril("span.mdl-checkbox__label", vnode.children)
	      ]
	    ),
	  oncreate: upgradeElement
	};

	function openMapFilter(e) {
	  e.preventDefault();
	  state.map.filter.open = true;
	  save();
	}

	function closeMapFilter(e) {
	  e.preventDefault();
	  state.map.filter.open = false;
	  save();
	}

	const Sidebar = {
	  view: vnode => [
	    state.map.filter.open ? mithril(".sidebar__shader") : [],
	    mithril(
	      Button,
	      {
	        class: [
	          "sidebar__button",
	          "mdl-js-ripple-effect",
	          "mdl-button--colored"
	        ].join(" "),
	        onclick: openMapFilter
	      },
	      [mithril("i.material-icons", "settings")]
	    ),
	    mithril(
	      ".sidebar",
	      {
	        class: state.map.filter.open ? "" : "sidebar--closed"
	      },
	      [
	        mithril(CloseButton, {
	          onclick: closeMapFilter
	        }),
	        mithril(Filter),
	        mithril(Layers)
	      ]
	    )
	  ]
	};

	const Geocache = {
	  view: vnode => {
	    const gc = vnode.attrs.gc;
	    if (!gc) return;
	    return [
	      mithril(
	        "h1.geocache__title",
	        {
	          class: gc.parsed.disabled ? "geocache__title--disabled" : ""
	        },
	        gc.parsed.name
	      ),
	      mithril(".geocache-stats", [
	        mithril(
	          GeocacheItem,
	          { label: "Code" },
	          mithril(
	            "a",
	            { href: "https://coord.info/" + gc.id, target: "_blank" },
	            gc.id
	          )
	        ),
	        mithril(GeocacheItem, { label: "Coordinates" }, formatCoordinates(gc.parsed)),
	        mithril(
	          GeocacheItem,
	          { label: "Kind" },
	          `${gc.parsed.size} ${gc.parsed.type}`
	        ),
	        mithril(GeocacheItem, { label: "Difficulty" }, gc.parsed.difficulty),
	        mithril(GeocacheItem, { label: "Terrain" }, gc.parsed.terrain),
	        mithril(GeocacheItem, { label: "Favorites" }, gc.parsed.favpoints),
	        mithril(GeocacheItem, { label: "Fetched" }, daysAgo(gc.api_date)),
	        mithril(
	          GeocacheItem,
	          { label: "Hint" },
	          gc.parsed.hint ? gc.parsed.hint : "n/a"
	        )
	      ])
	    ];
	  }
	};

	const GeocacheItem = {
	  view: vnode =>
	    mithril(".map-control-detail-stats-wrapper", [
	      mithril(
	        "span.map-control-detail-stats-wrapper--key.mdl-color-text--grey-600",
	        vnode.attrs.label
	      ),
	      mithril("span.map-control-detail-stats-wrapper--value", ...vnode.children)
	    ])
	};

	function formatCoordinates({ lat, lon }) {
	  const f = (coord, pos, neg) => {
	    const deg = Math.floor(coord);
	    const min = (coord - deg) * 60;
	    const prefix = coord < 0 ? neg : pos;
	    return `${prefix} ${deg}\u00b0 ${min.toFixed(3)}`;
	  };
	  return `${f(lat, "N", "S")} ${f(lon, "E", "W")}`;
	}

	function daysAgo(date) {
	  const delta = new Date() - Date.parse(date);
	  const days = Math.floor(delta / 1000 / 60 / 60 / 24);
	  switch (days) {
	    case 0:
	      return "less than 24 hrs ago";
	    case 1:
	      return "a day ago";
	    default:
	      return days + " days ago";
	  }
	}

	const Detail = {
	  view: vnode =>
	    mithril(
	      ".detail",
	      {
	        class: state.map.details.open ? "" : "detail--closed"
	      },
	      [
	        mithril(".detail__anchor", vnode.children),
	        mithril(".detail__wrapper", [
	          mithril(CloseButton, {
	            onclick: () => {
	              state.map.details.open = false;
	              save();
	            }
	          }),
	          mithril(Geocache, { gc: state.map.details.gc })
	        ])
	      ]
	    )
	};

	function toggleVisibility() {
	  state.map.types.open ^= true;
	  save();
	}

	const FloatingContainer = {
	  view: () =>
	    mithril(".filter-types", [
	      mithril(
	        ".filter-types__container",
	        {
	          class: state.map.types.open ? "" : "filter-types__container--closed"
	        },
	        [
	          mithril(TypeButton, { type: "traditional" }),
	          mithril(TypeButton, { type: "multi" }),
	          mithril(TypeButton, { type: "earth" }),
	          mithril(TypeButton, { type: "letterbox" }),
	          mithril(TypeButton, { type: "virtual" }),
	          mithril(TypeButton, { type: "cito" }),
	          mithril(TypeButton, { type: "event" }),
	          mithril(TypeButton, { type: "webcam" }),
	          mithril(TypeButton, { type: "wherigo" }),
	          mithril(TypeButton, { type: "mystery" })
	        ]
	      ),
	      mithril(
	        Button,
	        {
	          class:
	            "filter-types__button--main mdl-button--colored mdl-js-ripple-effect",
	          onclick: toggleVisibility
	        },
	        [mithril("i.material-icons", "add")]
	      )
	    ])
	};

	const TypeButton = {
	  view: vnode =>
	    mithril(
	      Button,
	      {
	        class: "filter-types__button",
	        onclick: () => toggleTypeFilter(vnode.attrs.type)
	      },
	      [
	        mithril("img", {
	          src: lookup$2(vnode.attrs.type).src,
	          class: getTypeFilter(vnode.attrs.type)
	            ? ""
	            : "filter-types__button--disabled"
	        })
	      ]
	    )
	};

	const debug$7 = browser("gc:map:location");

	var marker = null;
	var centerPosition;
	var lastAccuracy = null;
	var searching = false;

	// initialized and started geo location
	function init$1() {
	  debug$7("init");
	  centerPosition = true;
	  let map = getMap();
	  map.locate({ watch: true, enableHighAccuracy: true });
	  map.on("locationfound", onLocationFound);
	  map.on("locationerror", onLocationError);
	  map.on("zoomend", onZoom);
	}

	// stoped geolocation and cleanup
	function close() {
	  debug$7("close");
	  let map = getMap();
	  map.stopLocate();
	  map.off("locationfound", onLocationFound);
	  map.off("locationerror", onLocationError);
	  map.off("zoomend", onZoom);
	  if (marker != null) {
	    map.removeLayer(marker);
	    marker = null;
	  }
	  lastAccuracy = null;
	}

	// update the marker of the local position
	// first update by enable center the map to to current position
	function onLocationFound(e) {
	  debug$7("update location %o, %d", e.latlng, e.accuracy);
	  let map = getMap();
	  lastAccuracy = e.accuracy;
	  if (centerPosition) {
	    map.panTo(e.latlng);
	    centerPosition = false;
	  }
	  let radius = getRadiusForLocationMarker(map);
	  if (marker != null) {
	    marker.setLatLng(e.latlng);
	    marker.setRadius(radius);
	  } else {
	    marker = L.circleMarker(e.latlng, { radius: radius }).addTo(map);
	  }
	}

	// calculate the radius of the location marker in relation to the zoom level
	function getRadiusForLocationMarker(map) {
	  // see https://wiki.openstreetmap.org/wiki/Zoom_levels
	  const c = 40075016.686;
	  const meterPerPixel =
	    (c * Math.abs(Math.cos((map.getCenter().lat * Math.PI) / 180))) /
	    Math.pow(2, map.getZoom() + 8);

	  debug$7(
	    "radius: accuracy: %d, zoom: %d, m per px: %f",
	    lastAccuracy,
	    map.getZoom(),
	    meterPerPixel
	  );

	  return Math.max(1, lastAccuracy / meterPerPixel);
	}

	// show information that localisation didn't work
	function onLocationError(e) {
	  debug$7("location error %o", e);
	  close();
	  alert(e.message);
	}

	function onZoom() {
	  if (marker != null && lastAccuracy != null) {
	    marker.setRadius(getRadiusForLocationMarker(getMap()));
	  }
	}

	function toggleLocation() {
	  searching = !searching;
	  if (searching) {
	    init$1();
	  } else {
	    close();
	  }
	}

	const LocationButton = {
	  view: () =>
	    mithril(".location", [
	      mithril(
	        Button,
	        {
	          class: "location__button",
	          onclick: toggleLocation
	        },
	        [
	          mithril(
	            "i.material-icons",
	            searching ? "location_searching" : "location_disabled"
	          )
	        ]
	      )
	    ])
	};

	const Root = {
	  view: () => mithril("#root", [mithril(Layout)])
	};

	const Layout = {
	  view: () =>
	    mithril(".mdl-layout.mdl-js-layout", [
	      // m(Header),
	      mithril(Content)
	    ])
	};

	const Content = {
	  view: () =>
	    mithril("main.mdl-layout__content", [
	      mithril(Map$1),
	      mithril(Detail, [mithril(FloatingContainer)]),
	      mithril(Sidebar),
	      mithril(LocationButton),
	      mithril(ProgressBar)
	    ])
	};

	load();
	mithril.mount(document.body, Root);

	/*
	if ("serviceWorker" in navigator) {
	  navigator.serviceWorker.register("sw.js").then(function() {
	    console.log("Service Worker Registered");
	  });
	}
	*/

}());
