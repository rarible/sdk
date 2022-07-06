import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toUnionAddress } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function getBalance() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")
	const balance = await sdk.balances.getBalance(
		toUnionAddress("TEZOS:tz1Mxsc66En4HsVHr6rppYZW82ZpLhpupToC"),
		{ "@type": "XTZ" }
	)
	console.log(balance.toString())
}
getBalance()
