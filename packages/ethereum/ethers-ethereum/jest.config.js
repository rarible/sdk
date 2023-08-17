module.exports = {
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	bail: true,
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	globals: {
		crypto: {
			getRandomValues: (arr) => require("crypto").randomBytes(arr.length),
		},
	},
}
