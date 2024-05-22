module.exports = {
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/jest.setup.js", "dotenv/config"],
  setupFilesAfterEnv: ["jest-allure/dist/setup"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  testRunner: "jest-jasmine2",
  reporters: ["default", "jest-allure"],
}
