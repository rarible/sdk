module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-build.json",
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
}
