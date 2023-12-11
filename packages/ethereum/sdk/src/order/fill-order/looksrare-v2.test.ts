import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { EthereumNetwork } from "../../types"
import { createRaribleSdk } from "../../index"
import { DEV_PK_2, GOERLI_CONFIG } from "../../common/test/test-credentials"
import { awaitOrder } from "../test/await-order"
import type { SimpleLooksrareV2Order } from "../types"

describe("looksrare v2 fill tests", () => {
	const { provider: providerBuyer } = createE2eProvider(
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
		const hash = "0x8e6c6f9acc448a3f736d31ca2dce2b32918d4c33c92e285a2c9095309f5e38d6"
		const order = await awaitOrder(sdkBuyer, hash) as SimpleLooksrareV2Order
		const tx = await sdkBuyer.order.buy({
			order: order,
			amount: 1,
			originFees: [],
		})
		console.log("tx", tx)
		await tx.wait()
	})
})
