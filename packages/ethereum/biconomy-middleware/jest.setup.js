global.FormData = require("form-data")
global.window = {
  fetch: require("node-fetch"),
}
global.CustomEvent = class CustomEvent extends Event {
  constructor(message, data) {
    super(message, data)
    this.detail = data.detail
  }
}

jest.setTimeout(2000 * 60)
