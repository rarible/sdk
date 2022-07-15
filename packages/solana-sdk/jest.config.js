module.exports = {
	roots: ["<rootDir>/src"],
	setupFiles: [
		"<rootDir>/jest.setup.js",
		"dotenv/config",
	],
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
}
