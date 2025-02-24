const crypto = require("crypto")

module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js", "dotenv/config"],
  bail: true,
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "source-map-support/register": "identity-obj-proxy",
  },
  testResultsProcessor: "jest-junit",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        runner: "groups",
      },
    ],
  ],
  globals: {
    crypto: {
      getRandomValues: arr => crypto.randomBytes(arr.length),
    },
    ...crypto,
  },
  runner: "groups",
}
