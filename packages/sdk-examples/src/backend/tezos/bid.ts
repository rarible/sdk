import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/node"
import { toBigNumber, toContractAddress, toItemId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function bid() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = await createRaribleSdk(wallet, "testnet")
	const bidOrderId = await sdk.order.bid({
		itemId: toItemId("TEZOS:YOUR_CONTRACT_ID:YOUR_ITEM_ID"),
		amount: 1,
		price: "0.000002",
		currency: {
			"@type": "TEZOS_FT",
			contract: toContractAddress("TEZOS:KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv"),
			tokenId: toBigNumber("0"),
		},
	})
	console.log("bid order id", bidOrderId)
}
bid()
