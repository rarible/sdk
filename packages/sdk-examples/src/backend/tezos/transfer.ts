import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toItemId, toUnionAddress } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function transferItem() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const transferAction = await sdk.nft.transfer({
		itemId: toItemId("TEZOS:YOUR_ORDER_ID"),
	})
	const tx = await transferAction.submit({
		to: toUnionAddress("TEZOS:ITEM_RECIPIENT"),
	})
	console.log("tx", tx)
	await tx.wait()
}
transferItem()
