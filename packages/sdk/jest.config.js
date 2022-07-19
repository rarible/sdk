module.exports = {
	testEnvironment: "jest-environment-node",
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js", "dotenv/config"],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"<rootDir>/build/",
		"<rootDir>/node_modules/",
	],
}
