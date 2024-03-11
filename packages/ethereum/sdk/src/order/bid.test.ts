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
import { retry } from "../common/retry"
import { getApis as getApisTemplate } from "../common/apis"
import { DEV_PK_1, getTestContract } from "../common/test/test-credentials"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { OrderBid } from "./bid"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { createErc20Contract } from "./contracts/erc20"
import { approve as approveTemplate } from "./approve"
import { checkLazyOrder as checkLazyOrderTemplate } from "./check-lazy-order"
import { checkLazyAsset as checkLazyAssetTemplate } from "./check-lazy-asset"
import { checkLazyAssetType as checkLazyAssetTypeTemplate } from "./check-lazy-asset-type"
import { getEndDateAfterMonth } from "./test/utils"
import { awaitOrder } from "./test/await-order"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

/**
 * @group provider/dev
 */
describe.each(providers)("bid", (ethereum) => {
	const env = "dev-ethereum" as const
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const getApis = getApisTemplate.bind(null, ethereum, env)

	const signOrder = signOrderTemplate.bind(null, ethereum, getConfig)
	const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
	const signNft = signNftTemplate.bind(null, ethereum, getConfig)

	const send = getSendWithInjects()
	const mint = mintTemplate.bind(null, ethereum, send, signNft, getApis)
	const approve = approveTemplate.bind(null, ethereum, send, getConfig)
	const getBaseOrderFee = async () => 0

	const orderService = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFee, env)

	const checkLazyAssetType = checkLazyAssetTypeTemplate.bind(null, getApis)
	const checkLazyAsset = checkLazyAssetTemplate.bind(null, checkLazyAssetType)
	const checkLazyOrder = checkLazyOrderTemplate.bind(null, checkLazyAsset)

	const upserter = new UpsertOrder(
		orderService,
		send,
		getConfig,
		checkLazyOrder,
		approve,
		signOrder,
		getApis,
		ethereum,
		ZERO_WORD
	)
	const orderSell = new OrderBid(upserter, checkAssetType)
	const e2eErc721V3ContractAddress = getTestContract(env, "erc721V3")
	const treasury = createE2eWallet()
	const treasuryAddress = toAddress(treasury.getAddressString())

	const erc20Contract = getTestContract(env, "erc20")
	beforeAll(async () => {
		const contract = createErc20Contract(ethereum, erc20Contract)
		const tx = await send(
			contract.functionCall("mint", await ethereum.getFrom(), "1000000000000000000000")
		)
		await tx.wait()
	})

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

		const { order } = await orderSell.bid({
			type: "DATA_V2",
			maker: toAddress(wallet.getAddressString()),
			takeAssetType: {
				assetClass: "ERC721",
				contract: minted.contract,
				tokenId: minted.tokenId,
			},
			price: toBn(MIN_PAYMENT_VALUE.toFixed()),
			makeAssetType: {
				assetClass: "ERC20",
				contract: erc20Contract,
			},
			end: getEndDateAfterMonth(),
			amount: 1,
			payouts: [],
			originFees: [{
				account: treasuryAddress,
				value: 100,
			}],
		})
		expect(order.hash).toBeTruthy()

		await awaitOrder(await getApis(), order.hash)

		await retry(5, 2000, async () => {
			const nextPrice = MIN_PAYMENT_VALUE.plus(1).toFixed()
			const { order: updatedOrder } = await orderSell.update({
				orderHash: order.hash,
				price: toBigNumber(nextPrice),
			})

			expect(updatedOrder.make.value.toString()).toBe(nextPrice)
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
			take: {
				assetType: {
					assetClass: "ERC721",
					contract: minted.contract,
					tokenId: minted.tokenId,
				},
				value: toBigNumber("1"),
			},
			make: {
				assetType: {
					assetClass: "ERC20",
					contract: erc20Contract,
				},
				value: toBigNumber(MIN_PAYMENT_VALUE.toFixed()),
			},
			end: getEndDateAfterMonth(),
			salt: toBigNumber("10"),
			type: "RARIBLE_V1",
			data: {
				dataType: "LEGACY",
				fee: 250,
			},
			signature: toBinary("0x"),
		}
		const order = await upserter.upsert({ order: form })

		await awaitOrder(await getApis(), order.hash)

		await retry(5, 2000, async () => {
			const nextPrice = MIN_PAYMENT_VALUE.plus(1).toFixed()
			const { order: updatedOrder } = await orderSell.update({
				orderHash: order.hash,
				price: toBigNumber(nextPrice),
			})

			expect(updatedOrder.make.value.toString()).toBe(nextPrice)
		})
	})
})
