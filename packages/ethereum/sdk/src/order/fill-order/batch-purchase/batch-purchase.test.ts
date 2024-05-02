import type { Part } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import { getSimpleSendWithInjects } from "../../../common/send-transaction"
import { getEthereumConfig } from "../../../config"
import type { SimpleOrder } from "../../types"
import { createRaribleSdk } from "../../../index"
import { DEV_PK_1, DEV_PK_2, getTestContract } from "../../../common/test/test-credentials"
import { createE2eTestProvider } from "../../../common/test/create-test-providers"
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
	const { web3Ethereum: buyerEthereum } = createE2eTestProvider(DEV_PK_1)
	const { web3Ethereum: ethereum } = createE2eTestProvider(DEV_PK_2)

	const env = "dev-ethereum" as const

	const sdkBuyer = createRaribleSdk(buyerEthereum, env)
	const sdkSeller = createRaribleSdk(ethereum, env)

	const config = getEthereumConfig(env)
	const send = getSimpleSendWithInjects()

	async function buyout(orders: SimpleOrder[], originFees: Part[] | undefined) {
		const requests = ordersToRequests(orders, originFees)

		const tx = await sdkBuyer.order.buyBatch(requests)
		const result = await tx.wait()
		expect(result).toBeTruthy()

		await checkOwnerships(
			sdkBuyer,
			orders.map((o) => o.make),
			toAddress(await buyerEthereum.getFrom())
		)
	}

	test("RaribleOrder few items sell", async () => {
		const erc721Contract = getTestContract(env, "erc721V3")
		const orders = await Promise.all([
			makeRaribleV2Order(sdkSeller, erc721Contract),
			makeRaribleV2Order(sdkSeller, erc721Contract),
		])

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("Seaport few items sell", async () => {
		const erc721Contract = getTestContract(env, "erc721V3")
		const orders = await Promise.all([
			makeSeaportOrder(sdkSeller, ethereum, erc721Contract, send),
			makeSeaportOrder(sdkSeller, ethereum, erc721Contract, send),
		])

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("looksrare few items sell", async () => {
		const erc721Contract = getTestContract(env, "erc721V3")
		const orders = [
			await makeLooksrareOrder(sdkSeller, ethereum, erc721Contract, send, config),
			await makeLooksrareOrder(sdkSeller, ethereum, erc721Contract, send, config),
		]

		await buyout(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}])
	})

	test.skip("Different orders types sell", async () => {
		const erc721Contract = getTestContract(env, "erc721V3")
		const orders = await Promise.all([
			makeRaribleV2Order(sdkSeller, erc721Contract),
			makeSeaportOrder(sdkSeller, ethereum, erc721Contract, send),
			makeLooksrareOrder(sdkSeller, ethereum, erc721Contract, send, config),
			makeRaribleV2Order(sdkSeller, erc721Contract),
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
		const result = await tx.wait()
		expect(result).toBeTruthy()

		await checkOwnerships(
			sdkBuyer,
			orders.map((o) => o.make),
			toAddress(await buyerEthereum.getFrom())
		)
	})
})
