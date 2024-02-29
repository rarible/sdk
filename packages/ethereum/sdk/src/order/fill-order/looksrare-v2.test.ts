import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { LooksRareOrder } from "@rarible/ethereum-api-client"
import { createRaribleSdk } from "../../index"
import { DEV_PK_2, getE2EConfigByNetwork } from "../../common/test/test-credentials"

describe.skip("looksrare v2 fill tests", () => {
	const network = "testnet" as const
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_2, getE2EConfigByNetwork(network))
	const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer), gas: 3000000 })
	const sdkBuyer = createRaribleSdk(buyerWeb3, network)

	test("buy", async () => {
		const order = await sdkBuyer.apis.order.getValidatedOrderByHash({
			hash: "0x8e6c6f9acc448a3f736d31ca2dce2b32918d4c33c92e285a2c9095309f5e38d6",
		})
		const tx = await sdkBuyer.order.buy({
			order: order as LooksRareOrder,
			amount: 1,
			originFees: [],
		})
		const result = await tx.wait()
		expect(result.transactionHash).toBeTruthy()
	})
})
