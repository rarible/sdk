module.exports = {
	preset: "ts-jest",
	globals: {
		"ts-jest": {
			tsconfig: "<rootDir>/tsconfig.json", // use test config to support debugging {inlineSourceMap:true, sourceMap:true}
		},
	},
	testEnvironment: "jest-environment-node",
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js", "dotenv/config"],
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	modulePathIgnorePatterns: ["<rootDir>/src/sdk-blockchains/solana"],
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
