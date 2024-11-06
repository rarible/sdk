module.exports = {
  roots: ["<rootDir>/src"],
  bail: true,
  setupFiles: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig-build.json",
    },
    crypto: {
      getRandomValues: arr => require("crypto").randomBytes(arr.length),
    },
  },
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
