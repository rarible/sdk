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
