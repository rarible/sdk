module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js", "dotenv/config"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
  modulePathIgnorePatterns: ["<rootDir>/src/sdk-blockchains/solana"],
  transformIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  testResultsProcessor: "jest-junit",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
      },
    ],
  ],
}
