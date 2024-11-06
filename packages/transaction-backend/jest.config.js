const crypto = require("crypto")
module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  bail: true,
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
    crypto: {
      getRandomValues: arr => crypto.randomBytes(arr.length),
    },
    ...crypto,
  },
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "source-map-support/register": "identity-obj-proxy",
  },
  testEnvironment: "node",
}
