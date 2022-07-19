import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toItemId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function sellAndUpdate() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const sellAction = await sdk.order.sell({
		itemId: toItemId("TEZOS:YOUR_COLLECTION_ID:YOUR_ITEM_ID"),
	})
	const sellOrderId = await sellAction.submit({
		amount: 1,
		price: "0.000002",
		currency: {
			"@type": "XTZ",
		},
	})
	console.log("sellOrderId", sellOrderId)
	const updateAction = await sdk.order.sellUpdate({ orderId: sellOrderId })
	//You can only decrease price of sell order for security reasons
	//If you want to force change sell price you should cancel sell order
	await updateAction.submit({ price: "0.000001" })
}
sellAndUpdate()
