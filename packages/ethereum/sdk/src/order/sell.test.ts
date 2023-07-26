import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { OrderForm } from "@rarible/ethereum-api-client"
import {
	Configuration,
	GatewayControllerApi,
	NftCollectionControllerApi,
	NftLazyMintControllerApi,
	OrderControllerApi,
} from "@rarible/ethereum-api-client"
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
import { delay, retry } from "../common/retry"
import { createEthereumApis } from "../common/apis"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { OrderSell } from "./sell"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { checkChainId } from "./check-chain-id"
import { getEndDateAfterMonth } from "./test/utils"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

describe.each(providers)("sell", (ethereum) => {
	const env: EthereumNetwork = "dev-ethereum"
	const configuration = new Configuration(getApiConfig(env))
	const nftCollectionApi = new NftCollectionControllerApi(configuration)
	const gatewayApi = new GatewayControllerApi(configuration)
	const nftLazyMintApi = new NftLazyMintControllerApi(configuration)
	const orderApi = new OrderControllerApi(configuration)
	const config = getEthereumConfig(env)
	const signOrder = signOrderTemplate.bind(null, ethereum, config)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)
	const signNft = signNftTemplate.bind(null, ethereum, config.chainId)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const mint = mintTemplate
		.bind(null, ethereum, send, signNft, nftCollectionApi)
		.bind(null, nftLazyMintApi, checkWalletChainId)
	const apis = createEthereumApis("testnet")

	const getBaseOrderFee = async () => 0
	const orderService = new OrderFiller(ethereum, send, config, apis, getBaseOrderFee, env)
	const upserter = new UpsertOrder(
		orderService,
		send,
		(x) => Promise.resolve(x),
		() => Promise.resolve(undefined),
		signOrder,
		orderApi,
		ethereum,
		checkWalletChainId,
		ZERO_WORD
	)
	const orderSell = new OrderSell(upserter, checkAssetType, checkWalletChainId)
	const e2eErc721V3ContractAddress = toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
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
			price: toBn("2"),
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

		const nextPrice = toBigNumber("1")

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
				value: toBigNumber("2"),
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

		const nextPrice = toBigNumber("1")

		await retry(5, 500, async () => {
			const updatedOrder = await orderSell.update({
				orderHash: order.hash,
				price: nextPrice,
			})
			expect(updatedOrder.take.value.toString()).toBe(nextPrice.toString())
		})
	})
})
