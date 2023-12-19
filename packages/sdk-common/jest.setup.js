global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
	dispatchEvent: () => {
	},
}
global.CustomEvent = function CustomEvent() {
	return
}
jest.setTimeout(290000)
