global.FormData = require("form-data")
global.window = {
	fetch: require("node-fetch"),
}
jest.setTimeout(20000)

// process.on("unhandledRejection", (error) => {
// 	// Will print "unhandledRejection err is not defined"
// 	const e = error
// 	console.log("unhandledRejection", e && e.message)
// })
