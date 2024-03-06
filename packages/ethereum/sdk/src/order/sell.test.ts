import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { OrderForm } from "@rarible/ethereum-api-client"
import { createE2eProvider, createE2eWallet } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils"
import { getEthereumConfig } from "../config"
import type { ERC721RequestV3 } from "../nft/mint"
import { mint as mintTemplate, MintResponseTypeEnum } from "../nft/mint"
import { createTestProviders } from "../common/test/create-test-providers"
import { getSendWithInjects } from "../common/send-transaction"
import { signNft as signNftTemplate } from "../nft/sign-nft"
import { createErc721V3Collection } from "../common/mint"
import { delay, retry } from "../common/retry"
import { getApis as getApisTemplate } from "../common/apis"
import { DEV_PK_1, getTestContract } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { OrderSell } from "./sell"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { getEndDateAfterMonth } from "./test/utils"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("sell", (ethereum) => {
	const env = "dev-ethereum" as const
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const getApis = getApisTemplate.bind(null, ethereum, env)

	const signOrder = signOrderTemplate.bind(null, ethereum, getConfig)
	const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
	const signNft = signNftTemplate.bind(null, ethereum, getConfig)
	const send = getSendWithInjects()
	const mint = mintTemplate.bind(null, ethereum, send, signNft, getApis)

	const getBaseOrderFee = async () => 0
	const orderService = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFee, env)
	const upserter = new UpsertOrder(
		orderService,
		send,
		getConfig,
		(x) => Promise.resolve(x),
		() => Promise.resolve(undefined),
		signOrder,
		getApis,
		ethereum,
		ZERO_WORD
	)
	const orderSell = new OrderSell(upserter, checkAssetType)
	const e2eErc721V3ContractAddress = getTestContract(env, "erc721V3")
	const treasury = createE2eWallet()
	const treasuryAddress = toAddress(treasury.getAddressString())

	test("create and update of v2 works", async () => {
		const makerAddress = toAddress(wallet.getAddressString())
		const minted = await mint({
			collection: createErc721V3Collection(e2eErc721V3ContractAddress),
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: makerAddress,
				value: 10000,
			}],
			royalties: [],
			lazy: false,
		} as ERC721RequestV3)
		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}

		const order = await orderSell.sell({
			type: "DATA_V2",
			maker: toAddress(wallet.getAddressString()),
			makeAssetType: {
				assetClass: "ERC721",
				contract: minted.contract,
				tokenId: minted.tokenId,
			},
			price: toBn(MIN_PAYMENT_VALUE.multipliedBy(2).toFixed()),
			takeAssetType: {
				assetClass: "ETH",
			},
			amount: 1,
			payouts: [],
			originFees: [{
				account: treasuryAddress,
				value: 100,
			}],
			start: Math.round(Date.now()/1000),
			end: Math.round(Date.now()/1000 + 2000000),
		})

		expect(order.hash).toBeTruthy()

		await delay(1000)

		const nextPrice = toBigNumber(MIN_PAYMENT_VALUE.toFixed())

		await retry(5, 500, async () => {
			const updatedOrder = await orderSell.update({
				orderHash: order.hash,
				price: nextPrice,
			})
			expect(updatedOrder.take.value.toString()).toBe(nextPrice.toString())
		})
	})

	test("create and update of v1 works", async () => {
		const makerAddress = toAddress(wallet.getAddressString())
		const minted = await mint({
			collection: createErc721V3Collection(e2eErc721V3ContractAddress),
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: makerAddress,
				value: 10000,
			}],
			royalties: [],
			lazy: false,
		} as ERC721RequestV3)

		if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
			await minted.transaction.wait()
		}

		const form: OrderForm = {
			...TEST_ORDER_TEMPLATE,
			maker: makerAddress,
			make: {
				assetType: {
					assetClass: "ERC721",
					contract: minted.contract,
					tokenId: minted.tokenId,
				},
				value: toBigNumber("1"),
			},
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber(MIN_PAYMENT_VALUE.plus(1).toFixed()),
			},
			salt: toBigNumber("10"),
			type: "RARIBLE_V1",
			data: {
				dataType: "LEGACY",
				fee: 250,
			},
			signature: toBinary("0x"),
			end: getEndDateAfterMonth(),
		}
		const order = await upserter.upsert({ order: form })

		await delay(1000)

		const nextPrice = toBigNumber(MIN_PAYMENT_VALUE.toFixed())

		await retry(5, 500, async () => {
			const updatedOrder = await orderSell.update({
				orderHash: order.hash,
				price: nextPrice,
			})
			expect(updatedOrder.take.value.toString()).toBe(nextPrice.toString())
		})
	})
})
