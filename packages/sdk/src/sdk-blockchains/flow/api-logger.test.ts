import { toOrderId } from "@rarible/types"
import { createSdk } from "../../common/test/create-sdk"

describe("flow api logger", () => {
  const sdk = createSdk(undefined, "testnet")

  test.concurrent("request url in FlowSDK.apis.* returns error with error.url", async () => {
    let error: any = null
    try {
      await sdk.order.bidUpdate.prepare({
        orderId: toOrderId("FLOW:106746924000000000000"),
      })
    } catch (e) {
      error = e
    }
    expect(error).toBeTruthy()
  })
})
