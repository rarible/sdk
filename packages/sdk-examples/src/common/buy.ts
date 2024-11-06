import { createRaribleSdk } from "@rarible/sdk"
import { toOrderId } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"

//Available only for ethereum
export async function buy(wallet: BlockchainWallet) {
  const sdk = createRaribleSdk(wallet, "testnet")
  const buyTx = await sdk.order.buy({
    orderId: toOrderId("<SELL_ORDER_ID>"),
    amount: 1,
    //optional
    infiniteApproval: true,
  })
  //If you have one or more items from collection you should accept one item at the time
  await buyTx.wait()
}
