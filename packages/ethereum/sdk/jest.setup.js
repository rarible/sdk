global.FormData = require("form-data")
global.window = {
  fetch: require("node-fetch"),
  dispatchEvent: () => {},
}
global.CustomEvent = class CustomEvent extends Event {
  constructor(message, data) {
    super(message, data)
    this.detail = data.detail
  }
}

jest.setTimeout(1000 * 60 * 3)

process.on("unhandledRejection", e => {
  console.log("ethereum sdk unhandledRejection", e)
})
