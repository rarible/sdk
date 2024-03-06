import { toAddress } from "@rarible/types"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { mintTokensToNewSudoswapPool } from "../amm/test/utils"
import { retry } from "../../../common/retry"
import type { SimpleAmmOrder } from "../../types"
import type { AmmOrderFillRequest } from "../types"
import { DEV_PK_1, DEV_PK_2, getTestContract } from "../../../common/test/test-credentials"
import { createRaribleSdk } from "../../../index"
import { getEthereumConfig } from "../../../config"
import { getSimpleSendWithInjects } from "../../../common/send-transaction"
import { makeAmmOrder, ordersToRequests } from "./test/common/utils"

/**
 * @group provider/dev
 */
describe("amm batch buy tests", () => {
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_1)
	const { provider: providerSeller } = createE2eProvider(DEV_PK_2)

	const env = "dev-ethereum" as const
	const web3Seller = new Web3(providerSeller)
	const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })
	const ethereum = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })

	const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer), gas: 3000000 })
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)
	const sdkSeller = createRaribleSdk(ethereumSeller, env)

	const config = getEthereumConfig(env)
	const send = getSimpleSendWithInjects()
	const sudoswapCurveAddress = getTestContract(env, "sudoswapCurve")

	test.skip("amm sudoswap few items sell form different pools", async () => {
		const contract = getTestContract(env, "erc721V3")
		const orders = await Promise.all([
			makeAmmOrder(sdkSeller, contract, sudoswapCurveAddress, ethereum, send, config),
			makeAmmOrder(sdkSeller, contract, sudoswapCurveAddress, ethereum, send, config),
		])

		const tx = await sdkBuyer.order.buyBatch(ordersToRequests(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}]))

		const result = await tx.wait()
		expect(result).toBeTruthy()
	})

	test("amm sudoswap few items sell from one pool one request", async () => {
		const { poolAddress, items, contract } = await mintTokensToNewSudoswapPool(
			sdkSeller,
			getTestContract(env, "erc721V3"),
			ethereum,
			send,
			config.sudoswap.pairFactory,
			sudoswapCurveAddress,
			3
		)
		const orderHash = "0x" + poolAddress.slice(2).padStart(64, "0")
		const order = await retry(20, 2000, () =>
			sdkSeller.apis.order.getValidatedOrderByHash({ hash: orderHash })
		) as SimpleAmmOrder

		const tx = await sdkBuyer.order.buyBatch([{
			order,
			amount: 1,
			originFees: [{
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 100,
			}],
			assetType: items.map(item => ({
				contract,
				tokenId: item,
			})),
		} as AmmOrderFillRequest])

		const result = await tx.wait()
		expect(result).toBeTruthy()
	})

})
