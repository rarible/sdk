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
	testResultsProcessor: "jest-junit",
	reporters: [
		"default",
		["jest-junit", {
			outputDirectory: "reports",
		}],
	],
}
