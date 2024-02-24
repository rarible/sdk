import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import type { LooksRareOrder } from "@rarible/ethereum-api-client"
import type { EthereumNetwork } from "../../types"
import { createRaribleSdk } from "../../index"
import { DEV_PK_2, GOERLI_CONFIG } from "../../common/test/test-credentials"
import { createE2eTestProvider } from "../../common/test/create-test-providers"

describe.skip("looksrare v2 fill tests", () => {
	const { provider: providerBuyer } = createE2eTestProvider(
		DEV_PK_2,
		GOERLI_CONFIG
	)

	const buyerWeb3 = new Web3Ethereum({
		web3: new Web3(providerBuyer as any),
		gas: 3000000,
	})

	const env: EthereumNetwork = "testnet"
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)

	test("buy", async () => {
		const order = await sdkBuyer.apis.order.getValidatedOrderByHash({
			hash: "0x8e6c6f9acc448a3f736d31ca2dce2b32918d4c33c92e285a2c9095309f5e38d6",
		})
		const tx = await sdkBuyer.order.buy({
			order: order as LooksRareOrder,
			amount: 1,
			originFees: [],
		})
		console.log("tx", tx)
		await tx.wait()
	})
})
