global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
	dispatchEvent: () => {
	},
}
global.CustomEvent = function CustomEvent() {
	return
}
jest.setTimeout(290000);
(function () {
	function createStorage() {
		var UNSET = Symbol()
		var s = {}

		var noopCallback = function noopCallback() {}

		var _itemInsertionCallback = noopCallback
		Object.defineProperty(s, "setItem", {
			get: function get() {
				return function (k) {
					var v = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : UNSET

					if (v === UNSET) {
						throw new TypeError("Failed to execute 'setItem' on 'Storage': 2 arguments required, but only 1 present.")
					}

					if (!s.hasOwnProperty(String(k))) {
						_itemInsertionCallback(s.length)
					}

					s[String(k)] = String(v)
				}
			},
		})
		Object.defineProperty(s, "getItem", {
			get: function get() {
				return function (k) {
					if (s.hasOwnProperty(String(k))) {
						return s[String(k)]
					} else {
						return null
					}
				}
			},
		})
		Object.defineProperty(s, "removeItem", {
			get: function get() {
				return function (k) {
					if (s.hasOwnProperty(String(k))) {
						delete s[String(k)]
					}
				}
			},
		})
		Object.defineProperty(s, "clear", {
			get: function get() {
				return function () {
					for (var k in s) {
						delete s[String(k)]
					}
				}
			},
		})
		Object.defineProperty(s, "length", {
			get: function get() {
				return Object.keys(s).length
			},
		})
		Object.defineProperty(s, "key", {
			value: function value(k) {
				var key = Object.keys(s)[String(k)]
				return !key ? null : key
			},
		})
		Object.defineProperty(s, "itemInsertionCallback", {
			get: function get() {
				return _itemInsertionCallback
			},
			set: function set(v) {
				if (!v || typeof v != "function") {
					v = noopCallback
				}

				_itemInsertionCallback = v
			},
		})
		return s
	}

	var global = require("global")

	var window = require("global/window")

	Object.defineProperty(global, "Storage", {
		value: createStorage,
	})
	Object.defineProperty(window, "Storage", {
		value: createStorage,
	})
	Object.defineProperty(global, "localStorage", {
		value: createStorage(),
	})
	Object.defineProperty(window, "localStorage", {
		value: global.localStorage,
	})
	Object.defineProperty(global, "sessionStorage", {
		value: createStorage(),
	})
	Object.defineProperty(window, "sessionStorage", {
		value: global.sessionStorage,
	})
})()
