import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { OrderForm } from "@rarible/ethereum-api-client"
import {
	Configuration,
	CollectionControllerApi,
	ItemControllerApi,
	OrderControllerApi,
} from "@rarible/api-client"
import { createE2eProvider, createE2eWallet } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils"
import { getEthereumConfig } from "../config"
import { getApiConfig } from "../config/api-config"
import type { ERC721RequestV3 } from "../nft/mint"
import { mint as mintTemplate, MintResponseTypeEnum } from "../nft/mint"
import { createTestProviders } from "../common/test/create-test-providers"
import { getSendWithInjects } from "../common/send-transaction"
import { signNft as signNftTemplate } from "../nft/sign-nft"
import { createErc721V3Collection } from "../common/mint"
import { retry } from "../common/retry"
import { createEthereumApis } from "../common/apis"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { getEthUnionAddr } from "../common/test"
import { OrderBid } from "./bid"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { createErc20Contract } from "./contracts/erc20"
import { checkChainId } from "./check-chain-id"
import { approve as approveTemplate } from "./approve"
import { checkLazyOrder as checkLazyOrderTemplate } from "./check-lazy-order"
import { checkLazyAsset as checkLazyAssetTemplate } from "./check-lazy-asset"
import { checkLazyAssetType as checkLazyAssetTypeTemplate } from "./check-lazy-asset-type"
import { getEndDateAfterMonth } from "./test/utils"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

describe.each(providers)("bid", (ethereum) => {
	const env: EthereumNetwork = "dev-ethereum"
	const configuration = new Configuration(getApiConfig(env))
	const nftCollectionApi = new CollectionControllerApi(configuration)
	const nftMintApi = new ItemControllerApi(configuration)
	const orderApi = new OrderControllerApi(configuration)
	const config = getEthereumConfig(env)
	const signOrder = signOrderTemplate.bind(null, ethereum, config)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)
	const signNft = signNftTemplate.bind(null, ethereum, config.chainId)
	const apis = createEthereumApis(env)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, checkWalletChainId)
	const mint = mintTemplate
		.bind(null, ethereum, send, signNft, nftCollectionApi)
		.bind(null, nftMintApi, checkWalletChainId)
	const approve = approveTemplate.bind(null, ethereum, send, config.transferProxies)
	const getBaseOrderFee = async () => 0

	const orderService = new OrderFiller(ethereum, send, config, apis, getBaseOrderFee, env)

	const checkLazyAssetType = checkLazyAssetTypeTemplate.bind(null, apis.nftItem, config.chainId)
	const checkLazyAsset = checkLazyAssetTemplate.bind(null, checkLazyAssetType)
	const checkLazyOrder = checkLazyOrderTemplate.bind(null, checkLazyAsset)

	const upserter = new UpsertOrder(
		orderService,
		send,
		config,
		checkLazyOrder,
		approve,
		signOrder,
		orderApi,
		ethereum,
		checkWalletChainId,
		ZERO_WORD
	)
	const orderSell = new OrderBid(upserter, checkAssetType, checkWalletChainId)
	const e2eErc721V3ContractAddress = getEthUnionAddr("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
	const treasury = createE2eWallet()
	const treasuryAddress = getEthUnionAddr(treasury.getAddressString())

	const erc20Contract = toAddress("0xA4A70E8627e858567a9f1F08748Fe30691f72b9e")
	beforeAll(async () => {
		const tx = await send(
			createErc20Contract(ethereum, erc20Contract)
				.functionCall("mint", await ethereum.getFrom(), "10000000")
		)
		await tx.wait()
	})

	test("create and update of v2 works", async () => {
		const makerAddress = getEthUnionAddr(wallet.getAddressString())
		const minted = await mint({
			collection: createErc721V3Collection(e2eErc721V3ContractAddress),
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: getEthUnionAddr(makerAddress),
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
				account: getEthUnionAddr(treasuryAddress),
				value: 100,
			}],
		})
		expect(order.hash).toBeTruthy()

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
