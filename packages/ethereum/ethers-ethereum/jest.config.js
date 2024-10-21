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
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig-build.json",
    },
    crypto: {
      getRandomValues: arr => require("crypto").randomBytes(arr.length),
    },
  },
}
