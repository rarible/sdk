module.exports = {
	roots: ["<rootDir>/src"],
	bail: true,
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	testResultsProcessor: "jest-junit",
	reporters: [
		"default",
		["jest-junit", {
			outputDirectory: "reports",
		}],
	],
}
