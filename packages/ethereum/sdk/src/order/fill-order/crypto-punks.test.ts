import { randomWord, toAddress, toBigNumber, toBinary, ZERO_ADDRESS } from "@rarible/types"
import {
	awaitAll,
	createGanacheProvider,
	deployTestErc20,
	deployTestErc721,
	deployTransferProxy,
	deployErc20TransferProxy,
	deployTestExchangeV2,
	deployTestRoyaltiesProvider,
	deployTestErc1155,
	deployCryptoPunks,
	deployCryptoPunkTransferProxy,
	deployCryptoPunkAssetMatcher,
} from "@rarible/ethereum-sdk-test-common"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { getEthereumConfig } from "../../config"
import type { SimpleOrder } from "../types"
import { id } from "../../common/id"
import { retry } from "../../common/retry"
import { getApis as getApisTemplate } from "../../common/apis"
import { sentTx } from "../../common/test"
import { createBuyerSellerProviders } from "../../common/test/create-test-providers"
import { OrderFiller } from "./index"

const { provider, wallets, web3, addresses } = createGanacheProvider()
const { providers } = createBuyerSellerProviders(provider, wallets)

describe.each(providers)("fillOrder", (buyerEthereum) => {
	const [buyerAddress, sellerAddress] = addresses
	const env = "testnet" as const
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const getApis = getApisTemplate.bind(null, buyerEthereum, env)

	const getBaseOrderFee = async () => 0
	const send = getSimpleSendWithInjects()
	const filler = new OrderFiller(buyerEthereum, send, getConfig, getApis, getBaseOrderFee, env)

	const it = awaitAll({
		testErc20: deployTestErc20(web3, "Test1", "TST1"),
		testErc721: deployTestErc721(web3, "Test", "TST"),
		testErc1155: deployTestErc1155(web3, "Test"),
		transferProxy: deployTransferProxy(web3),
		erc20TransferProxy: deployErc20TransferProxy(web3),
		royaltiesProvider: deployTestRoyaltiesProvider(web3),
		exchangeV2: deployTestExchangeV2(web3),
		punksMarket: deployCryptoPunks(web3),
		punksTransferProxy: deployCryptoPunkTransferProxy(web3),
		punkAssetMatcher: deployCryptoPunkAssetMatcher(web3),
	})

	beforeAll(async () => {
		/**
		 * Configuring
		 */
		await sentTx(
			it.exchangeV2.methods.__ExchangeV2_init(
				toAddress(it.transferProxy.options.address!),
				// ZERO_ADDRESS,
				toAddress(it.erc20TransferProxy.options.address!),
				toBigNumber("0"),
				// buyerAddress,
				ZERO_ADDRESS,
				// toAddress(it.royaltiesProvider.options.address)
				ZERO_ADDRESS
			),
			{ from: buyerAddress }
		)
		config.exchange.v1 = toAddress(it.exchangeV2.options.address!)
		config.exchange.v2 = toAddress(it.exchangeV2.options.address!)
		config.transferProxies.cryptoPunks = toAddress(it.punksTransferProxy.options.address!)
		config.chainId = 4

		await sentTx(it.erc20TransferProxy.methods.addOperator(toAddress(it.exchangeV2.options.address!)), {
			from: buyerAddress,
		})

		await sentTx(
			it.exchangeV2.methods.setTransferProxy(
				id("CRYPTO_PUNKS"),
				it.punksTransferProxy.options.address!
			),
			{ from: buyerAddress }
		)

		//Set asset matcher for crypto punks
		await sentTx(
			it.exchangeV2.methods.setAssetMatcher(
				id("CRYPTO_PUNKS"),
				it.punkAssetMatcher.options.address!
			),
			{ from: buyerAddress }
		)

		await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: buyerAddress })

	})

	test("get transaction data", async () => {
		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "CRYPTO_PUNKS",
					contract: toAddress(it.punksMarket.options.address!),
					tokenId: 0,
				},
				value: toBigNumber("1"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("10"),
			},
			salt: randomWord(),
			type: "CRYPTO_PUNK",
			data: {
				dataType: "CRYPTO_PUNKS_DATA",
			},
		}

		const finalOrder = { ...left, signature: toBinary("0x") }
		await filler.getTransactionData({ order: finalOrder, amount: 1 })
	})

	test("should fill order (buy) with crypto punks asset", async () => {
		//Mint crypto punks
		const punkId = 43
		const punkPrice = 10
		//Mint punks
		await sentTx(it.punksMarket.methods.getPunk(punkId), { from: sellerAddress })

		await sentTx(it.punksMarket.methods.offerPunkForSale(punkId, punkPrice), { from: sellerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "CRYPTO_PUNKS",
					contract: toAddress(it.punksMarket.options.address!),
					tokenId: punkId,
				},
				value: toBigNumber("1"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber(punkPrice.toFixed()),
			},
			salt: randomWord(),
			type: "CRYPTO_PUNK",
			data: {
				dataType: "CRYPTO_PUNKS_DATA",
			},
		}

		const finalOrder = { ...left, signature: toBinary("0x") }
		const tx = await filler.buy({ order: finalOrder, amount: 1 })
		await tx.wait()

		await retry(5, 500, async () => {
			const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

			expect(ownerAddress.toLowerCase()).toBe(buyerAddress.toLowerCase())
		})
	})

	test("should accept bid with crypto punks asset", async () => {
		const punkId = 50
		const punkPrice = 10
		//Mint punks
		await sentTx(it.punksMarket.methods.getPunk(punkId), { from: buyerAddress })

		await sentTx(it.punksMarket.methods.enterBidForPunk(punkId), { from: sellerAddress, value: punkPrice.toFixed() })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber(punkPrice.toFixed()),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "CRYPTO_PUNKS",
					contract: toAddress(it.punksMarket.options.address!),
					tokenId: punkId,
				},
				value: toBigNumber("1"),
			},
			salt: randomWord(),
			type: "CRYPTO_PUNK",
			data: {
				dataType: "CRYPTO_PUNKS_DATA",
			},
		}

		const finalOrder = { ...left, signature: toBinary("0x") }
		const tx = await filler.acceptBid({ order: finalOrder, amount: 1 })
		await tx.wait()

		await retry(5, 500, async () => {
			const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

			expect(ownerAddress.toLowerCase()).toBe(sellerAddress.toLowerCase())
		})
	})

})
