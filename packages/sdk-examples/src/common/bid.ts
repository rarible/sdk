import { createRaribleSdk } from "@rarible/sdk"
import { toItemId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/build/common/domain"

export async function bid(wallet: BlockchainWallet, assetType: RequestCurrency) {
  const sdk = createRaribleSdk(wallet, "testnet")
  const bidOrderId = await sdk.order.bid({
    itemId: toItemId("<ITEM_ID>"),
    amount: 1,
    price: "0.000002",
    currency: assetType,
  })
  return bidOrderId
}
