module.exports = {
	setupFiles: ["<rootDir>/jest.setup.js"],
	testEnvironment: "node",
	verbose: true,
	coveragePathIgnorePatterns: ["/node_modules/"],
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
}
