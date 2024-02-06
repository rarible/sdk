global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
}
jest.setTimeout(1000 * 60)

process.env.RPC_URL = "https://dev-ethereum-node.rarible.com"
process.env.SDK_ENV = "dev-ethereum"

process.env.RARIBLE_API_KEY="4df39770-4e14-42ce-87d8-27e6d0b68167"

process.env.POLYGON_SDK_ENV="dev-polygon"
process.env.POLYGON_API_URL="https://dev-polygon-api.rarible.org"
process.env.POLYGON_RPC_URL="https://dev-polygon-node.rarible.com"

process.env.ETEHREUM_SDK_ENV="dev-mainnet"
process.env.ETEHREUM_API_URL="https://dev-ethereum-api.rarible.org"
process.env.ETEHREUM_RPC_URL="https://dev-ethereum-node.rarible.com"

process.env.MANTLE_SDK_ENV="dev-mantle"
process.env.MANTLE_API_URL="https://dev-mantle-api.rarible.org"
process.env.MANTLE_RPC_URL="https://dev-mantle-node.rarible.com"
