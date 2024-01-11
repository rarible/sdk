import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { createE2eProvider, awaitAll, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils"
import { getEthereumConfig } from "../config"
import { createTestProviders } from "../common/test/create-test-providers"
import { createEthereumApis, getApis as getApisTemplate } from "../common/apis"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { MIN_PAYMENT_VALUE, MIN_PAYMENT_VALUE_DECIMAL } from "../common/check-min-payment-value"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { UpsertOrder } from "./upsert-order"
import { signOrder } from "./sign-order"
import { OrderFiller } from "./fill-order"

const { provider, wallet } = createE2eProvider("d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469")
const { providers, web3 } = createTestProviders(provider, wallet)
const it = awaitAll({
	testErc20: deployTestErc20(web3, "TST", "TST"),
})

describe.each(providers)("upsertOrder", (ethereum) => {
	const env = "dev-ethereum" as const
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const sign = signOrder.bind(null, ethereum, getConfig)
	const getApis = getApisTemplate.bind(null, ethereum, env)

	const getBaseOrderFee = async () => 0
	const send = getSimpleSendWithInjects()
	const orderService = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFee, env)

	const approve = () => Promise.resolve(undefined)
	const checkLazyOrder: any = async (form: any) => Promise.resolve(form)

	test.skip("sign and upsert works", async () => {

		const order: OrderForm = {
			...TEST_ORDER_TEMPLATE,
			salt: toBigNumber("10") as any,
			maker: toAddress(wallet.getAddressString()),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
			signature: toBinary("0x"),
			end: Date.now() + 1000 * 60 * 60 * 24 * 30,
		}
		const upserter = new UpsertOrder(
			orderService,
			send,
			getConfig,
			checkLazyOrder,
			approve,
			sign,
			getApis,
			ethereum,
			ZERO_WORD
		)

		const result = await upserter.upsert({ order })
		expect(result.hash).toBeTruthy()
	})

	test("getPrice should work with ETH", async () => {
		const request = {
			maker: toAddress(wallet.getAddressString()),
			makeAssetType: {
				assetClass: "ERC721",
				contract: toAddress("0x0000000000000000000000000000000000000001"),
				tokenId: toBigNumber("1"),
			},
			priceDecimal: toBn(MIN_PAYMENT_VALUE_DECIMAL.toFixed()),
			takeAssetType: {
				assetClass: "ETH" as const,
			},
			amount: 1,
			payouts: [],
			originFees: [],
		}
		const upserter = new UpsertOrder(
			orderService,
			send,
			getConfig,
			checkLazyOrder,
			approve,
			sign,
			getApis,
			ethereum,
			ZERO_WORD
		)

		const price = await upserter.getPrice(request, request.takeAssetType)
		expect(price.valueOf()).toBe(MIN_PAYMENT_VALUE.toFixed())
	})

	test("getPrice should work with ERC20", async () => {
		const request = {
			maker: toAddress(wallet.getAddressString()),
			makeAssetType: {
				assetClass: "ERC721",
				contract: toAddress("0x0000000000000000000000000000000000000001"),
				tokenId: toBigNumber("1"),
			},
			priceDecimal: toBn(MIN_PAYMENT_VALUE_DECIMAL.toFixed()),
			takeAssetType: {
				assetClass: "ERC20" as const,
				contract: toAddress(it.testErc20.options.address),
			},
			amount: 1,
			payouts: [],
			originFees: [],
		}
		const upserter = new UpsertOrder(
			orderService,
			send,
			getConfig,
			checkLazyOrder,
			approve,
			sign,
			getApis,
			ethereum,
			ZERO_WORD
		)

		const price = await upserter.getPrice(request, request.takeAssetType)
		expect(price.valueOf()).toBe(MIN_PAYMENT_VALUE.toFixed())
	})

	test("throw error if sell order has less than minimal payment value", async () => {
		const getApis = async () => {
			const apis = createEthereumApis(env)
			apis.order.upsertOrder = async () => ({} as any)
			return apis
		}

		const upserter = new UpsertOrder(
			orderService,
			send,
			getConfig,
			checkLazyOrder,
			approve,
			sign,
			getApis,
			ethereum,
			ZERO_WORD
		)
		const request = {
			maker: toAddress(wallet.getAddressString()),
			make: {
				assetType: {
					assetClass: "ERC721",
					contract: "ETHEREUM:0xd2bdd497db05622576b6cb8082fb08de042987ca",
					tokenId: "7135",
				},
				value: "1",
			},
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: "10",
			},
		} as any

		let err: any
		try {
		  await upserter.upsertRequest(request)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be greater or equal to")).toBeTruthy()

	})

})
