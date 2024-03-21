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
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig-build.json",
		},
		crypto: {
			getRandomValues: (arr) => require("crypto").randomBytes(arr.length),
		},
	},
}
