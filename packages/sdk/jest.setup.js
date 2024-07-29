require("mock-local-storage")

// Jest setup before each test
jest.setTimeout(290 * 1000)

// Shims and polyfills
global.FormData = require("form-data")
global.window = {
  fetch: require("node-fetch"),
  dispatchEvent: () => {},
}
global.CustomEvent = () => {}
