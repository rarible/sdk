const crypto = require("crypto")
module.exports = {
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"<rootDir>/build/",
		"<rootDir>/node_modules/",
	],
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig-build.json",
		},
		crypto: {
			getRandomValues: (arr) => crypto.randomBytes(arr.length),
		},
	},
}
