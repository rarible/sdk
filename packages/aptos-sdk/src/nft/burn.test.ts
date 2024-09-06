import { createTestAptosState, createV1Token, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("burn nft", () => {
  const state = createTestAptosState()
  const { aptos, account, config, wallet } = state
  const burnClass = new AptosNft(aptos, wallet, config)

  test("burn", async () => {
    const { tokenAddress } = await mintTestToken(state)

    await burnClass.burn(tokenAddress)

    const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: account.accountAddress })
    const tokenOfNewOwner = assets.find(asset => asset.token_data_id === tokenAddress)
    expect(tokenOfNewOwner).toBeFalsy()
  })

  test("burn v1 token", async () => {
    const { propertyVersion, collectionName, tokenName, creator } = await createV1Token(state)
    const tx = await burnClass.burnV1Token(creator, collectionName, tokenName, `${propertyVersion}`, "1")
    console.log("tx", tx)
  })
})
