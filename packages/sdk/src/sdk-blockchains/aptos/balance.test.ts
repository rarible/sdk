import { createTestAptosState, DEFAULT_PK } from "@rarible/aptos-sdk/src/common/test"
import { Blockchain } from "@rarible/api-client"
import { createSdk } from "./common/tests/create-sdk"
import { APTOS_CURRENCY_ID_ZERO_ADDRESS, convertAptosToUnionAddress } from "./common"

describe("aptos balances", () => {
  const sellerState = createTestAptosState(DEFAULT_PK)
  const sdk = createSdk(sellerState, "development")
  const recepientAddress = convertAptosToUnionAddress(sellerState.account.accountAddress.toString())

  test("wallet balance with currency id", async () => {
    const balance = await sdk.balances.getBalance(recepientAddress, APTOS_CURRENCY_ID_ZERO_ADDRESS)
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
