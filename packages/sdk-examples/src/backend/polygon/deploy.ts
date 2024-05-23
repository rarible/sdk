import { createRaribleSdk } from "@rarible/sdk"
import { Blockchain } from "@rarible/api-client"
import { updateNodeGlobalVars } from "../common"
import { initWalletWeb3WithHDWalletWithEstimate } from "./common"

updateNodeGlobalVars()

async function deploy() {
	try {
		if (!process.env["ETH_PRIVATE_KEY"]) {
			throw new Error("Expected ETH_PRIVATE_KEY env variable")
		}
		const raribleSdkWallet = await initWalletWeb3WithHDWalletWithEstimate(process.env["ETH_PRIVATE_KEY"])
		const raribleSdk = createRaribleSdk(raribleSdkWallet, "testnet")

		const { address, tx } = await raribleSdk.nft.createCollection({
			blockchain: Blockchain.POLYGON,
			type: "ERC721",
			name: "name",
			symbol: "RARI",
			baseURI: "https://ipfs.rarible.com",
			contractURI: "https://ipfs.rarible.com",
			isPublic: true,
		})
		console.log("address", address)
		await tx.wait()
		console.log("tx", tx)
	} catch (e) {
		console.log("Error", e)
	}
}

deploy()
