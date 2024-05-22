import { createE2eProvider, DEV_PK_1, getTestContract } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../index"
import { LogsLevel } from "../types"
import type { ERC721RequestV3 } from "../nft/mint"
import { MintResponseTypeEnum } from "../nft/mint"
import { awaitItem } from "../nft/test/await-item"
import { getTestAPIKey } from "./test/test-credentials"
import { createErc721V3Collection } from "./mint"
import { createTestProviders } from "./test/create-test-providers"

/**
 * @group type/common
 */
describe("api keys", () => {
  const { provider, wallet } = createE2eProvider(DEV_PK_1)
  const { providers } = createTestProviders(provider, wallet)

  const env = "dev-ethereum" as const
  const erc721V3ContractAddress = getTestContract(env, "erc721V3")

  let testItemId: string

  beforeAll(async () => {
    const sdk = createRaribleSdk(providers[0], env, {
      apiKey: getTestAPIKey(env),
    })
    const response = await sdk.nft.mint({
      collection: createErc721V3Collection(erc721V3ContractAddress),
      uri: "ipfs://ipfs/hash",
      royalties: [],
      lazy: false,
    } as ERC721RequestV3)
    testItemId = response.itemId
    if (response.type === MintResponseTypeEnum.ON_CHAIN) {
      await response.transaction.wait()
    }
    await awaitItem(sdk.apis, testItemId)
  })

  test("get item without API key should be succeed", async () => {
    const sdk = createRaribleSdk(undefined, "dev-ethereum", {
      logs: {
        level: LogsLevel.DISABLED,
      },
    })
    await sdk.apis.nftItem.getNftItemById({ itemId: testItemId })
  })

  test("get item with valid API key should be succeed", async () => {
    const sdk = createRaribleSdk(undefined, "dev-ethereum", {
      logs: {
        level: LogsLevel.DISABLED,
      },
      apiKey: getTestAPIKey(env),
    })
    await sdk.apis.nftItem.getNftItemById({
      itemId: testItemId,
    })
  })

  test("get item with invalid API key should be failed", async () => {
    const sdk = createRaribleSdk(undefined, "dev-ethereum", {
      logs: {
        level: LogsLevel.DISABLED,
      },
      apiKey: "00000000-0000-0000-0000-000000000001",
    })
    let responseError
    try {
      await sdk.apis.nftItem.getNftItemById({
        itemId: testItemId,
      })
    } catch (e: any) {
      responseError = await e.json()
    }
    expect(responseError).toBeTruthy()
    expect(responseError.status).toBe(403)
    expect(responseError.message).toBe("API key not found")
  })
})
