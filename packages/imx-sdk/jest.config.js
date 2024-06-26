module.exports = {
  setupFiles: ["<rootDir>/jest.setup.js"],
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
}
