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
}
