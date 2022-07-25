import { createRaribleSdk } from "@rarible/sdk/src"
import { toCollectionId } from "@rarible/types"
import { initWalletWeb3, updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function mint() {
	try {
		if (!process.env["ETH_PRIVATE_KEY"]) {
			throw new Error("Expected ETH_PRIVATE_KEY env variable")
		}
		const raribleSdkWallet = await initWalletWeb3(process.env["ETH_PRIVATE_KEY"])
		const raribleSdk = createRaribleSdk(raribleSdkWallet, "testnet")

		const response = await raribleSdk.nft.mint({
			collectionId: toCollectionId("ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		await response.transaction.wait()
		console.log("minted response", response)
	} catch (e) {
		console.log("Error", e)
	}
}

mint()
