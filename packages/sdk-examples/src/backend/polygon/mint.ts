import { createRaribleSdk } from "@rarible/sdk/src"
import { toCollectionId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"
import { initWalletWeb3WithHDWalletWithEstimate } from "./common"

updateNodeGlobalVars()

async function mint() {
	try {
		if (!process.env["ETH_PRIVATE_KEY"]) {
			throw new Error("Expected ETH_PRIVATE_KEY env variable")
		}
		const raribleSdkWallet = await initWalletWeb3WithHDWalletWithEstimate(process.env["ETH_PRIVATE_KEY"])
		const raribleSdk = await createRaribleSdk(raribleSdkWallet, "testnet")

		const response = await raribleSdk.nft.mint({
			collectionId: toCollectionId("POLYGON:0x5a3ed919c18137dcc67fbea707d7e41f3e498bef"),
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
