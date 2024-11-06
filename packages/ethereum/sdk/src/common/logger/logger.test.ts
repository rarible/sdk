import { createE2eTestProvider } from "../test/create-test-providers"
import { createRemoteLogger } from "./logger"

jest.useFakeTimers()
describe("logger test", () => {
  const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
  const { web3Ethereum: ethereum } = createE2eTestProvider(pk)

  test("createRemoteLogger", async () => {
    createRemoteLogger({
      ethereum,
      env: "dev",
    })
  })
})
