import { Account } from "@aptos-labs/ts-sdk"
import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("transfer nft", () => {
  const { aptos, account } = createTestAptosState()
  const wallet = new AptosGenericSdkWallet(aptos, account)
  const transferClass = new AptosNft(aptos, wallet)

  test("transfer", async () => {
    const recepientAccount = Account.generate()
    const receipentAddress = recepientAccount.accountAddress.toStringLong()
    const testTokenAddress = await mintTestToken(aptos, account)

    await transferClass.transfer(testTokenAddress, receipentAddress)

    const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: receipentAddress })
    const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
    expect(tokenOfNewOwner).toBeTruthy()
  })
})
