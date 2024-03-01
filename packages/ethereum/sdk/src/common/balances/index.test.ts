import { createE2eWallet } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { ApiService } from "../apis"
import { getEthereumConfig } from "../../config"
import { getTestAPIKey } from "../test/test-credentials"
import { ConfigService } from "../config"
import { Balances } from "./index"

describe("Balances", () => {
	const wallet = createE2eWallet()
	const walletAddress = toAddress(wallet.getAddressString())

	// We don't do test of all possible networks because it's
	// already covered in tests of ApiService
	const network = "mainnet" as const
	const configService = new ConfigService("mainnet", undefined)
	const apiService = new ApiService(configService, {
		apiKey: getTestAPIKey(network),
	})
	const balances = new Balances(apiService)
	const config = getEthereumConfig(network)

	const fungibleAssets = [
		{ assetClass: "ETH" },
		{ assetClass: "ERC20", contract: config.weth },
	] as const

	test.each(fungibleAssets)("get balance for $assetClass", async (asset) => {
		const balance = await balances.getBalance(walletAddress, asset)
		expect(balance.toString()).toBe("0")
	})

	// test.concurrent("mint erc20, mint tokens and wait for update", async () => {
	// 	@todo here we should:
	// 		1. deploy new erc20
	// 		2. mint tokens to new user
	// 		3. check the balance api
	// })
})
