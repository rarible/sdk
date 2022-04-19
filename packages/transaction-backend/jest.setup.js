global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
}
jest.setTimeout(1000 * 60)
process.env.RPC_URL = "https://dev-ethereum-node.rarible.com"
process.env.SDK_ENV = "dev-ethereum"
