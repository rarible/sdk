global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
}
jest.setTimeout(1000 * 60 * 3)
