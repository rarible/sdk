module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js"],
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
  testEnvironment: "node",
}
