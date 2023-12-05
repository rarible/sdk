import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type {
	OrderForm,
} from "@rarible/api-client"
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
import { delay, retry } from "../common/retry"
import { createEthereumApis } from "../common/apis"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { getEthUnionAddr } from "../common/test"
import { OrderSell } from "./sell"
import { signOrder as signOrderTemplate } from "./sign-order"
import { OrderFiller } from "./fill-order"
import { UpsertOrder } from "./upsert-order"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"
import { checkChainId } from "./check-chain-id"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)

describe.each(providers)("sell", (ethereum) => {
	const env: EthereumNetwork = "dev-ethereum"
	const configuration = new Configuration(getApiConfig(env))
	const nftCollectionApi = new CollectionControllerApi(configuration)
	const nftLazyMintApi = new ItemControllerApi(configuration)
	const orderApi = new OrderControllerApi(configuration)
	const config = getEthereumConfig(env)
	const signOrder = signOrderTemplate.bind(null, ethereum, config)
	const checkAssetType = checkAssetTypeTemplate.bind(null, nftCollectionApi)
	const signNft = signNftTemplate.bind(null, ethereum, config.chainId)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, checkWalletChainId)
	const mint = mintTemplate
		.bind(null, ethereum, send, signNft, nftCollectionApi)
		.bind(null, nftLazyMintApi, checkWalletChainId)
	const apis = createEthereumApis("testnet")

	const getBaseOrderFee = async () => 0
	const orderService = new OrderFiller(ethereum, send, config, apis, getBaseOrderFee, env)
	const upserter = new UpsertOrder(
		orderService,
		send,
		config,
		(x) => Promise.resolve(x),
		() => Promise.resolve(undefined),
		signOrder,
		orderApi,
		ethereum,
		checkWalletChainId,
		ZERO_WORD
	)
	const orderSell = new OrderSell(upserter, ethereum, checkAssetType, checkWalletChainId)
	const e2eErc721V3ContractAddress = getEthUnionAddr("0x6972347e66A32F40ef3c012615C13cB88Bf681cc")
	const treasury = createE2eWallet()
	const treasuryAddress = toAddress(treasury.getAddressString())

	test("create and update of v2 works", async () => {
		const makerAddress = getEthUnionAddr(wallet.getAddressString())
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
			maker: getEthUnionAddr(wallet.getAddressString()),
			makeAssetType: {
				"@type": "ERC721",
				contract: minted.contract,
				tokenId: minted.tokenId,
			},
			price: toBn(MIN_PAYMENT_VALUE.multipliedBy(2).toFixed()),
			takeAssetType: {
				"@type": "ETH",
			},
			amount: 1,
			payouts: [],
			originFees: [{
				account: getEthUnionAddr(treasuryAddress),
				value: 100,
			}],
			start: Math.round(Date.now()/1000),
			end: Math.round(Date.now()/1000 + 2000000),
		})

		expect(order.id).toBeTruthy()

		await delay(1000)

		const nextPrice = toBigNumber(MIN_PAYMENT_VALUE.toFixed())

		await retry(5, 500, async () => {
			const updatedOrder = await orderSell.update({
				orderHash: order.id,
				price: nextPrice,
			})
			expect(updatedOrder.take.value.toString()).toBe(nextPrice.toString())
		})
	})

})
