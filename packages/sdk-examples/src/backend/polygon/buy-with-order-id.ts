import fetch from "node-fetch"
import { toOrderId } from "@rarible/types"
import { createRaribleSdk } from "@rarible/sdk"
import { initWalletWeb3, updateNodeGlobalVars } from "../common"

if (process.env["ORDER_ID"] === undefined) {
	throw new Error("Provide ORDER_ID as environment variables!")
}

updateNodeGlobalVars()

// Buy function
async function buy(item: string) {
	// item is token_address:token_id
	try {
		if (!process.env["ETH_PRIVATE_KEY"]) {
			throw new Error("Expected ETH_PRIVATE_KEY env variable")
		}
		const raribleSdkWallet = await initWalletWeb3(process.env["ETH_PRIVATE_KEY"])
		//@ts-ignore
		const raribleSdk = createRaribleSdk(raribleSdkWallet, "prod", { fetchApi: fetch })

		if (!process.env["ORDER_ID"]) {
			throw new Error("ORDER_ID has not been specified")
		}
		const orderId = toOrderId(process.env["ORDER_ID"])
		if (orderId) {
			console.log("Sell order was found, purchasing...")
			const request = await raribleSdk.order.buy({ orderId })
			console.log("The transaction was sent, waiting for a Rarible Protocol response...")
			const response = await request.submit({ amount: 1 })
			await response.wait()
			console.log("Rarible Protocol response:", response)
		} else {
			console.warn(`Sell order was not found for item=${item}`)
		}
	} catch (e) {
		console.log("Error", e)
	}
}

// Buying 1 item of https://rinkeby.rarible.com/token/0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:18661571940073987827662103527955627190048515004732602540856362757661044768826?tab=owners
buy(process.env["ORDER_ID"])
