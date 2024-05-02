jest.setTimeout(3 * 1000 * 60)

const { Crypto } = require("@peculiar/webcrypto")

global.crypto = new Crypto()
