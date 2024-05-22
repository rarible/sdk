module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
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
