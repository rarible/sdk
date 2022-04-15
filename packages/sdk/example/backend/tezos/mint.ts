import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toContractAddress } from "@rarible/types"
import { MintType } from "../../../src/types/nft/mint/domain"
import { updateNodeGlobalVars } from "../../../src/common/update-node-global-vars"

updateNodeGlobalVars()

async function mint() {
	const walletEdsk = "edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6" +
    "H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	const provider = in_memory_provider(
		walletEdsk,
		"https://test-tezos-node.rarible.org"
	)
	const wallet = new TezosWallet(provider)
	const sdk = createRaribleSdk(wallet, "dev")

	const nftCollection = toContractAddress("TEZOS:KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43")
	const mintAction = await sdk.nft.mint({
		collectionId: nftCollection,
	})
	const mintResult = await mintAction.submit({
		uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		royalties: [],
		lazyMint: false,
		supply: 1,
	})
	console.log("mint", mintResult)
	if (mintResult.type === MintType.ON_CHAIN) {
		await mintResult.transaction.wait()
	}
}
mint()
