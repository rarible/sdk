jest.setTimeout(60000)
global.FormData = require("form-data")
global.window = {
  fetch: require("node-fetch"),
  dispatchEvent: () => {},
  addEventListener: () => {},
}
global.CustomEvent = function CustomEvent() {
  return
}
