module.exports = {
	roots: ["<rootDir>/tests"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"<rootDir>/build/",
		"<rootDir>/node_modules/",
	],
}
