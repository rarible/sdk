import type { Middleware } from "../middleware/middleware"

function log(type: "debug" | "info" | "error", message: string) {
	console.log(`[${(new Date()).toISOString()}] ${type}: ${message}`)
}

export const logRequest: Middleware = (callable, args) => {
	log("debug", `method: ${callable.name}\nArgs: ${JSON.stringify(args)}`)

	return Promise.resolve([callable, async (res) => {
		return res
	}])
}

export const logError: Middleware = (callable, args) => {
	return Promise.resolve([callable, async (res) => {
		res.catch((err) => log("error", `method ${callable.name} ${err}`))
		return res
	}])
}
