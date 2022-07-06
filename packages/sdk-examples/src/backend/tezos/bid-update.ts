import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toBigNumber, toContractAddress, toItemId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function bidUpdate() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const bidAction = await sdk.order.bid({
		itemId: toItemId("TEZOS:YOUR_CONTRACT_ID:YOUR_ITEM_ID"),
	})
	const bidOrderId = await bidAction.submit({
		amount: 1,
		price: "0.000002",
		currency: {
			"@type": "TEZOS_FT",
			contract: toContractAddress("TEZOS:KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv"),
			tokenId: toBigNumber("0"),
		},
	})
	console.log("bid order id", bidOrderId)

	const updateAction = await sdk.order.bidUpdate({
		orderId: bidOrderId,
	})
	//You can only increase price of bid order for security reasons
	//If you want to force change bid price you should cancel order
	await updateAction.submit({ price: "0.000003" })
}
bidUpdate()
