global.FormData = require("form-data")
global.window = {
  fetch: require("node-fetch"),
}
jest.setTimeout(2000 * 60)
