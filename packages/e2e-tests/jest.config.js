module.exports = {
	roots: ["<rootDir>/tests"],
	setupFiles: [
		"<rootDir>/jest.setup.js",
		"dotenv/config",
	],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"<rootDir>/build/",
		"<rootDir>/node_modules/",
	],
}
