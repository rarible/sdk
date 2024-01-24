require("mock-local-storage")
global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
	dispatchEvent: () => {
	},
}
global.CustomEvent = class CustomEvent extends Event {
	constructor(message, data) {
		super(message, data)
		this.detail = data.detail
	}
}
jest.setTimeout(290000)
process.env.SDK_API_KEY_TESTNET="2cadd8fe-5e34-4fe8-bc59-d9dbafc30ef5"
