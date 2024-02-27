import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Part } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import { getSimpleSendWithInjects } from "../../../common/send-transaction"
import { getEthereumConfig } from "../../../config"
import type { SimpleOrder } from "../../types"
import { createRaribleSdk } from "../../../index"
import { DEV_PK_1, DEV_PK_2, getTestContract } from "../../../common/test/test-credentials"
import { checkOwnerships, makeLooksrareOrder, makeRaribleV2Order, makeSeaportOrder, ordersToRequests } from "./test/common/utils"

describe("Batch purchase", function () {
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

	async function buyout(orders: SimpleOrder[], originFees: Part[] | undefined) {
		const requests = ordersToRequests(orders, originFees)

		const tx = await sdkBuyer.order.buyBatch(requests)
		const result = await tx.wait()
		expect(result).toBeTruthy()

		await checkOwnerships(
			sdkBuyer,
			orders.map((o) => o.make),
			toAddress(await buyerWeb3.getFrom())
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
			toAddress(await buyerWeb3.getFrom())
		)
	})
})
