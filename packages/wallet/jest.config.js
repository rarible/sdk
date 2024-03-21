const crypto = require("crypto")
module.exports = {
	roots: ["<rootDir>/src"],
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
