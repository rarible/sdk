import { createRaribleSdk } from "@rarible/sdk/node"
import { initSolanaWallet } from "./common"

if (process.env["BUYOUT_ITEM_ID"] === undefined) {
	throw new Error("Provide BUYOUT_ITEM_ID as environment variables!")
}

// Buy function
async function buy(item: string) {
	// item is token_address:token_id
	if (process.env["SOLANA_PK"] === undefined) {
		throw new Error("Provide SOLANA_PK as environment variables!")
	}
	try {
		const raribleSdkWallet = initSolanaWallet(process.env["SOLANA_PK"])
		const raribleSdk = await createRaribleSdk(raribleSdkWallet, "testnet")

		console.log(`SDK was created, searching sell order for item=${item}...`)
		const order = (await raribleSdk.apis.item.getItemById({ itemId: "SOLANA:" + item })).bestSellOrder
		if (order) {
			console.log("Sell order was found, purchasing...")
			const response = await raribleSdk.order.buy({
				orderId: order.id,
				amount: 1,
			})
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
buy(process.env["BUYOUT_ITEM_ID"])
