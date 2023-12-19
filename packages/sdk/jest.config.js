module.exports = {
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
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig-build.json",
        },
    },
}
