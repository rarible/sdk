import { DEV_PK_1 } from "@rarible/ethereum-sdk-test-common"
import type { ItemId } from "@rarible/api-client"
import { createSdk } from "../common/test/create-sdk"
import { createRaribleSdk } from "../index"
import { LogsLevel } from "../domain"
import { initProviders } from "../sdk-blockchains/ethereum/test/init-providers"
import { mintTestERC721 } from "../sdk-blockchains/ethereum/test/mint-erc-721"

describe("server api keys", () => {
  const { web31 } = initProviders({ pk1: DEV_PK_1 })
  let itemId: ItemId
  beforeAll(async () => {
    itemId = await mintTestERC721(web31)
  })

  test("get item without API key should be succeed", async () => {
    const sdk = createSdk(undefined, "development")
    await sdk.apis.item.getItemById({ itemId })
  })

  test("get item with valid API key should be succeed", async () => {
    const sdk = createSdk(undefined, "development")
    await sdk.apis.item.getItemById({ itemId })
  })

  test("get item with invalid API key should be failed", async () => {
    const sdk = createRaribleSdk(undefined, "development", {
      logs: LogsLevel.DISABLED,
      apiKey: "eb0e4c76-b662-4c3d-8121-3643a7eb75ba",
    })

    let responseError
    try {
      await sdk.apis.item.getItemById({
        itemId,
      })
    } catch (e: any) {
      responseError = await e.json()
    }
    expect(responseError.status).toBe(403)
    expect(responseError.message).toBe("API key not found")
  })
})
