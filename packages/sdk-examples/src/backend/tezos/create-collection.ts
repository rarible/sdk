import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "@rarible/sdk/build"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function createCollection() {
	const wallet = new TezosWallet(
		in_memory_provider(
			"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
      "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
			"https://rpc.tzkt.io/ithacanet"
		)
	)
	const sdk = createRaribleSdk(wallet, "dev")

	const result = await sdk.nft.createCollection({
		blockchain: Blockchain.TEZOS,
		asset: {
			assetType: "NFT",
			arguments: {
				name: "My NFT collection",
				symbol: "MYNFT",
				contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
				isUserToken: false,
			},
		},
	})
	console.log("address of new collection", result.address)
	await result.tx.wait()
}
createCollection()
