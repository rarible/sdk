import { awaitAll, deployTestErc1155 } from "@rarible/ethereum-sdk-test-common"
import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { Address, OrderForm } from "@rarible/ethereum-api-client"
import { deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { getEthereumConfig } from "../config"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { getApis as getApisTemplate } from "../common/apis"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { createE2eTestProvider, createEthereumProviders } from "../common/test/create-test-providers"
import { sentTxConfirm } from "../common/test"
import { cancel } from "./cancel"
import { signOrder } from "./sign-order"
import { UpsertOrder } from "./upsert-order"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { OrderFiller } from "./fill-order"
import { approve as approveTemplate } from "./approve"
import { getEndDateAfterMonth } from "./test/utils"

const { provider, wallet } = createE2eTestProvider(DEV_PK_1)
const { providers, web3v4 } = createEthereumProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("cancel order", (ethereum) => {
	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const getApis = getApisTemplate.bind(null, ethereum, env)

	const sign = signOrder.bind(null, ethereum, getConfig)

	const getBaseOrderFee = async () => 0
	const send = getSimpleSendWithInjects()
	const approve = approveTemplate.bind(null, ethereum, send, getConfig)
	const orderService = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFee, env)

	const it = awaitAll({
		testErc20: deployTestErc20(web3v4, "Test1", "TST1"),
		testErc721: deployTestErc721(web3v4, "Test", "TST"),
		testErc1155: deployTestErc1155(web3v4, "Test"),
	})
	let from: Address

	beforeAll(async () => {
		from = toAddress(await ethereum.getFrom())
	})

	test(`[${ethereum.constructor.name}] ExchangeV2 should work`, async () => {
		await sentTxConfirm(it.testErc721.methods.mint(from, "10", "0x"), { from })
		const form: OrderForm = {
			...TEST_ORDER_TEMPLATE,
			make: {
				assetType: {
					assetClass: "ERC721",
					contract: toAddress(it.testErc721.options.address!),
					tokenId: toBigNumber("10"),
				},
				value: toBigNumber("10"),
			},
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber(MIN_PAYMENT_VALUE.toFixed()),
			},
			salt: toBigNumber("10") as any,
			maker: toAddress(wallet.getAddressString()),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
			signature: toBinary("0x"),
			end: getEndDateAfterMonth(),
		}
		const { tx, order } = await testOrder(form)
		const events = await tx.getEvents()
		expect(events.some(e => e.event === "Cancel" && (e?.returnValues?.hash || e?.args?.hash) === order.hash)).toBe(true)
	})

	async function testOrder(form: OrderForm) {
		const checkLazyOrder = <T>(form: T) => Promise.resolve(form)
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

		const order = await upserter.upsert({ order: form })
		const tx = await cancel(checkLazyOrder, ethereum, send, getConfig, getApis, order)
		await tx.wait()
		return { tx, order }
	}
})
