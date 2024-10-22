import { TestUtils } from "@rarible/aptos-sdk"
import { Blockchain } from "@rarible/api-client"
import { createSdk } from "./common/tests/create-sdk"
import { APTOS_APT_CURRENCY, convertAptosToUnionAddress } from "./common"

describe("aptos balances", () => {
  const sellerState = TestUtils.createTestAptosState(TestUtils.DEFAULT_PK)
  const sdk = createSdk(sellerState, "testnet")
  const recepientAddress = convertAptosToUnionAddress(sellerState.account.accountAddress.toString())

  test("wallet balance with currency id", async () => {
    const balance = await sdk.balances.getBalance(recepientAddress, APTOS_APT_CURRENCY)
    expect(balance).toBeTruthy()
  })

  test("wallet balance with asset type", async () => {
    const balance = await sdk.balances.getBalance(recepientAddress, {
      "@type": "CURRENCY_NATIVE",
      blockchain: Blockchain.APTOS,
    })
    expect(balance).toBeTruthy()
  })
})
