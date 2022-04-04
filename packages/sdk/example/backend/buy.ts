import { EthersEthereum } from "@rarible/ethers-ethereum"
import { ethers } from "ethers"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/sdk"
import fetch from "node-fetch"
import { initNodeProvider, updateNodeGlobalVars } from "./common"


if (process.env["ETH_PRIVATE_KEY"] === undefined ||
  process.env["ETHEREUM_RPC_URL"] === undefined ||
  process.env["ETHEREUM_NETWORK_ID"] === undefined ||
  process.env["BUYOUT_TARGET"] === undefined
) throw new Error("Provide ETH_PK and ETH_RPC_ENDPOINT as environment variables!")

updateNodeGlobalVars()

const privateKey = process.env["ETH_PRIVATE_KEY"]

const provider = initNodeProvider(privateKey, {
	rpcUrl: process.env["ETHEREUM_RPC_URL"],
	networkId: +process.env["ETHEREUM_NETWORK_ID"],
})
const raribleEthers = new ethers.providers.Web3Provider(provider)

//@ts-ignore
const raribleProvider = new EthersEthereum(new ethers.Wallet(privateKey, raribleEthers))
const raribleSdkWallet = new EthereumWallet(raribleProvider)
//@ts-ignore
const raribleSdk = createRaribleSdk(raribleSdkWallet, "staging", { fetchApi: fetch })

// Buy function
async function buy(item: string) {
	// item is token_address:token_id
	const order = (await raribleSdk.apis.item.getItemById({ itemId: "ETHEREUM:" + item })).bestSellOrder
	if (order) {
		try {
			const request = await raribleSdk.order.buy({ orderId: order.id })
			console.log("The transaction was sent, waiting for a Rarible Protocol response...")
			const response = await request.submit({ amount: 1 })
			console.log("Rarible Protocol response:", response)
		} catch (e) {
			console.log("Error", e)
		}
	}
}

// Buying 1 item of https://rinkeby.rarible.com/token/0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:18661571940073987827662103527955627190048515004732602540856362757661044768826?tab=owners
buy(process.env["BUYOUT_TARGET"]).then(_ => {})
