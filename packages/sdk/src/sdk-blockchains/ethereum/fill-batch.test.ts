import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { Blockchain, Platform } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"

describe("prepareOrderForBatchPurchase", () => {
	const {
		web31,
	} = initProviders()
	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const sdk1 = createRaribleSdk(new EthereumWallet(ethereum1), "development", { logs: LogsLevel.DISABLED })

	test("Check prepare batch order response", async () => {
		const order = await sdk1.apis.order.getSellOrders({
			blockchains: [Blockchain.ETHEREUM],
			platform: Platform.RARIBLE,
			size: 1,
		})
		const prepareAction = await sdk1.order.prepareOrderForBatchPurchase(
			{ orderId: toOrderId(order.orders[0].id) },
		)
		expect(prepareAction.supportsBatchPurchase).toBeTruthy()
	})
})
