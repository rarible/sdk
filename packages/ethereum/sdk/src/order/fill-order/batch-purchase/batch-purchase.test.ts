import {
	createE2eProvider,
} from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Part } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import { getSimpleSendWithInjects } from "../../../common/send-transaction"
import { getEthereumConfig } from "../../../config"
import type { SimpleOrder } from "../../types"
import { createRaribleSdk } from "../../../index"
import type { EthereumNetwork } from "../../../types"
import { DEV_PK_1, DEV_PK_2 } from "../../../common/test/test-credentials"
import {
	checkOwnerships,
	makeLooksrareOrder,
	makeRaribleV2Order,
	makeSeaportOrder,
	ordersToRequests,
} from "./test/common/utils"

/**
 * @group provider/dev
 */
describe("Batch purchase", function () {
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_1)
	const { provider: providerSeller } = createE2eProvider(DEV_PK_2)

	const env: EthereumNetwork = "dev-ethereum"
	const web3Seller = new Web3(providerSeller as any)
	const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })
	const ethereum = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })

	const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer as any), gas: 3000000 })
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)
	const sdkSeller = createRaribleSdk(ethereumSeller, env)

	const config = getEthereumConfig(env)
	const send = getSimpleSendWithInjects()

	beforeAll(async () => {
		console.log({
			buyerWallet: await buyerWeb3.getFrom(),
			sellerWallet: await ethereumSeller.getFrom(),
		})
	})

	async function buyout(orders: SimpleOrder[], originFees: Part[] | undefined) {
		const requests = ordersToRequests(orders, originFees)

		const tx = await sdkBuyer.order.buyBatch(requests)
		console.log(tx)
		await tx.wait()

		await checkOwnerships(
			sdkBuyer,
			orders.map((o) => o.make),
			toAddress(await buyerWeb3.getFrom())
		)
	}

	test("RaribleOrder few items sell", async () => {
		const orders = await Promise.all([
			makeRaribleV2Order(sdkSeller, env),
			makeRaribleV2Order(sdkSeller, env),
		])

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("Seaport few items sell", async () => {
		const orders = await Promise.all([
			makeSeaportOrder(sdkSeller, ethereum, env, send),
			makeSeaportOrder(sdkSeller, ethereum, env, send),
		])

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("looksrare few items sell", async () => {
		const orders = [
			await makeLooksrareOrder(sdkSeller, ethereum, env, send, config),
			await makeLooksrareOrder(sdkSeller, ethereum, env, send, config),
		]

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("Different orders types sell", async () => {
		const orders = await Promise.all([
			makeRaribleV2Order(sdkSeller, env),
			makeSeaportOrder(sdkSeller, ethereum, env, send),
			makeLooksrareOrder(sdkSeller, ethereum, env, send, config),
			makeRaribleV2Order(sdkSeller, env),
		])

		const requests = [
			...(ordersToRequests([orders[0]], [{
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 100,
			}])),
			...(ordersToRequests([orders[1]], [{
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 400,
			}, {
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 300,
			}])),
			...(ordersToRequests([orders[2]], [{
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 200,
			}, {
				account: toAddress("0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a"),
				value: 500,
			}])),
			...(ordersToRequests([orders[3]], undefined)),
		]

		const tx = await sdkBuyer.order.buyBatch(requests)
		console.log(tx)
		await tx.wait()

		await checkOwnerships(
			sdkBuyer,
			orders.map((o) => o.make),
			toAddress(await buyerWeb3.getFrom())
		)
	})
})
