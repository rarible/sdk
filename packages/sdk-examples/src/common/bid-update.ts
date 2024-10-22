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
  const updatedOrderId = await sdk.order.bidUpdate({
    orderId: bidOrderId,
    price: "0.000003",
  })
  //You can only increase price of bid order for security reasons
  //If you want to force change bid price you should cancel order
  await updatedOrderId
}
