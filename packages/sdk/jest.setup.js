global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
	dispatchEvent: () => {
	},
}
const fetch = require("node-fetch").default
global.fetch = fetch
global.CustomEvent = function CustomEvent() {
	return
}
jest.setTimeout(60000)
