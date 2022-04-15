import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toItemId } from "@rarible/types"
import { updateNodeGlobalVars } from "../../../src/common/update-node-global-vars"

updateNodeGlobalVars()

async function sellItem() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
        "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://test-tezos-node.rarible.org"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const sellAction = await sdk.order.sell({
		itemId: toItemId("TEZOS:KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43:3"),
	})
	const sellOrderId = await sellAction.submit({
		amount: 1,
		price: "0.000002",
		currency: {
			"@type": "XTZ",
		},
	})
	console.log("sellOrderId", sellOrderId)
}
sellItem()
