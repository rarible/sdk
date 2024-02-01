const crypto = require("crypto")
module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
		crypto: {
			getRandomValues: (arr) => crypto.randomBytes(arr.length),
		},
		...crypto,
	},
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	bail: true,
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"<rootDir>/build/",
		"<rootDir>/node_modules/",
	],
	moduleNameMapper: {
		"source-map-support/register": "identity-obj-proxy",
	},
	testEnvironment: "node",

}
