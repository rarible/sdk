import { createRaribleSdk } from "@rarible/sdk"
import { toCollectionId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"
import { initFlowWallet } from "./common"

updateNodeGlobalVars()

async function mint() {
	try {
		if (!process.env["FLOW_PRIVATE_KEY"] || !process.env["FLOW_ACCOUNT_ADDRESS"]) {
			throw new Error("Provide FLOW_PRIVATE_KEY and FLOW_ACCOUNT_ADDRESS as environment variables")
		}
		const raribleSdkWallet = await initFlowWallet(process.env["FLOW_ACCOUNT_ADDRESS"], process.env["FLOW_PRIVATE_KEY"])
		const raribleSdk = createRaribleSdk(raribleSdkWallet, "testnet")

		const response = await raribleSdk.nft.mint({
			collectionId: toCollectionId("FLOW:A.ebf4ae01d1284af8.RaribleNFT"),
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
