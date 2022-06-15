import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toOrderId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"


updateNodeGlobalVars()

async function acceptBid() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://dev-tezos-node.rarible.org"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const bidAction = await sdk.order.acceptBid({
		orderId: toOrderId("TEZOS:YOUR_ORDER_ID"),
	})
	const tx = await bidAction.submit({
		amount: 1,
		infiniteApproval: true,
	})
	await tx.wait()
	console.log("tx", tx)
}
acceptBid()
