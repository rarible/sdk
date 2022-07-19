import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toItemId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function burn() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const burnAction = await sdk.nft.burn({
		itemId: toItemId("TEZOS:KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43:3"),
	})
	const tx = await burnAction.submit({ amount: 1 })
	if (tx) {
	  await tx.wait()
	}
}
burn()
