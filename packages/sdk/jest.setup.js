global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
	crypto: require("crypto"),
	dispatchEvent: () => {
	},
}
const fetch = require("node-fetch").default
global.fetch = fetch
global.crypto = require("crypto")
global.CustomEvent = function CustomEvent() {
	return
}
jest.setTimeout(60000)
