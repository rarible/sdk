import { Account } from "@aptos-labs/ts-sdk"
import { BUYER_PK, createTestAptosState, createV1Token, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("transfer nft", () => {
  const state = createTestAptosState()
  const receiverState = createTestAptosState(BUYER_PK)
  const { aptos, wallet, config } = state
  const transferClass = new AptosNft(aptos, wallet, config)

  test("transfer", async () => {
    const recepientAccount = Account.generate()
    const receipentAddress = recepientAccount.accountAddress.toStringLong()
    const { tokenAddress } = await mintTestToken(state)

    await transferClass.transfer(tokenAddress, receipentAddress)

    const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: receipentAddress })
    const tokenOfNewOwner = assets.find(asset => asset.token_data_id === tokenAddress)
    expect(tokenOfNewOwner).toBeTruthy()
  })

  test("transfer v1 token", async () => {
    const recepientAccount = Account.generate()
    const receipentAddress = recepientAccount.accountAddress.toStringLong()
    const { propertyVersion, collectionName, tokenName, creator } = await createV1Token(state)
    const tx = await transferClass.transferV1Token(
      receipentAddress,
      creator,
      collectionName,
      tokenName,
      propertyVersion.toString(),
      "1",
    )
  })
})
