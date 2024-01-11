import { randomAddress, randomWord, toAddress, toBigNumber, toBinary, toWord, ZERO_ADDRESS } from "@rarible/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { toBn } from "@rarible/utils/build/bn"
import {
	awaitAll,
	createGanacheProvider,
	deployCryptoPunkAssetMatcher,
	deployCryptoPunks,
	deployCryptoPunkTransferProxy,
	deployErc20TransferProxy,
	deployTestErc1155,
	deployTestErc20,
	deployTestErc721,
	deployTestExchangeV2,
	deployTestRoyaltiesProvider,
	deployTransferProxy,
} from "@rarible/ethereum-sdk-test-common"
import { ethers } from "ethers"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { getSimpleSendWithInjects, sentTx, sentTxConfirm } from "../../common/send-transaction"
import { getEthereumConfig } from "../../config"
import { signOrder } from "../sign-order"
import type { SimpleOrder } from "../types"
import { id } from "../../common/id"
import { approveErc20 } from "../approve-erc20"
import { getApis as getApisTemplate } from "../../common/apis"
import { createRaribleSdk } from "../../index"
import { FILL_CALLDATA_TAG } from "../../config/common"
import type { EthereumNetwork } from "../../types"
import type { BuyOrderRequest } from "./types"
import { OrderFiller } from "./index"

describe("buy & acceptBid orders", () => {
	const { addresses, provider, accounts } = createGanacheProvider()
	const [account1] = accounts
	const [buyerAddress, sellerAddress] = addresses
	const web3 = new Web3(provider as any)
	const buyerEthereum = new Web3Ethereum({ web3, from: buyerAddress, gas: 1000000 })
	const sellerEthereum = new Web3Ethereum({ web3, from: sellerAddress, gas: 1000000 })

	const ethersWeb3Provider = new ethers.providers.Web3Provider(provider as any)
	const buyerEthersWeb3Provider1 = new EthersWeb3ProviderEthereum(ethersWeb3Provider, buyerAddress)
	const buyerEthersEthereum1 =	new EthersEthereum(
		new ethers.Wallet(account1.secretKey, ethersWeb3Provider)
	)

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const getConfig = async () => config
	const getApisBuyer = getApisTemplate.bind(null, buyerEthereum, env)
	const getApisSeller = getApisTemplate.bind(null, sellerEthereum, env)

	const send = getSimpleSendWithInjects()
	const getBaseOrderFee = async () => 100
	const filler = new OrderFiller(buyerEthereum, send, getConfig, getApisBuyer, getBaseOrderFee, env)

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

	// beforeEach(async () => await delay(500))

	beforeAll(async () => {
		/**
		 * Configuring
		 */
		await sentTx(
			it.exchangeV2.methods.__ExchangeV2_init(
				toAddress(it.transferProxy.options.address),
				toAddress(it.erc20TransferProxy.options.address),
				toBigNumber("0"),
				buyerAddress,
				toAddress(it.royaltiesProvider.options.address)
			),
			{ from: buyerAddress }
		)
		config.exchange.v1 = toAddress(it.exchangeV2.options.address)
		config.exchange.v2 = toAddress(it.exchangeV2.options.address)
		config.transferProxies.cryptoPunks = toAddress(it.punksTransferProxy.options.address)
		config.transferProxies.erc20 = toAddress(it.erc20TransferProxy.options.address)
		// config.chainId = 200500

		await sentTx(it.transferProxy.methods.addOperator(toAddress(it.exchangeV2.options.address)), {
			from: buyerAddress,
		})
		await sentTx(it.erc20TransferProxy.methods.addOperator(toAddress(it.exchangeV2.options.address)), {
			from: buyerAddress,
		})

		//Set transfer proxy for crypto punks
		await sentTx(
			it.exchangeV2.methods.setTransferProxy(
				id("CRYPTO_PUNKS"),
				it.punksTransferProxy.options.address
			),
			{ from: buyerAddress }
		)

		//Set asset matcher for crypto punks
		await sentTx(
			it.exchangeV2.methods.setAssetMatcher(
				id("CRYPTO_PUNKS"),
				it.punkAssetMatcher.options.address
			),
			{ from: buyerAddress }
		)

		await sentTx(it.punksMarket.methods.allInitialOwnersAssigned(), { from: buyerAddress })

		await sentTx(it.testErc20.methods.mint(buyerAddress, 10000), { from: buyerAddress })
		await sentTx(it.testErc1155.methods.mint(sellerAddress, 999, 100, "0x"), { from: buyerAddress })

	})

	test("should match order(buy erc1155 for erc20)", async () => {
		//sender1 has ERC20, sender2 has ERC1155

		await sentTxConfirm(it.testErc20.methods.mint(buyerAddress, 100), { from: buyerAddress })
		await sentTxConfirm(it.testErc1155.methods.mint(sellerAddress, 1, 10, "0x"), { from: buyerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				value: toBigNumber("10"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		await sentTx(it.testErc20.methods.approve(it.erc20TransferProxy.options.address, toBn(10)), {
			from: buyerAddress,
		})

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const finalOrder = { ...left, signature }

		const startErc20Balance = toBn(await it.testErc20.methods.balanceOf(sellerAddress).call())
		const startErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())

		const filler = new OrderFiller(buyerEthereum, send, getConfig, getApisBuyer, getBaseOrderFee, env)
		const buyRequest = { order: finalOrder, amount: 1, payouts: [], originFees: [] } as BuyOrderRequest
		await filler.getTransactionData(buyRequest)
		const tx = await filler.buy(buyRequest)
		await tx.wait()

		const finishErc20Balance = toBn(await it.testErc20.methods.balanceOf(sellerAddress).call())
		const finishErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())

		expect(finishErc20Balance.minus(startErc20Balance).toString()).toBe("2")
		expect(finishErc1155Balance.minus(startErc1155Balance).toString()).toBe("1")
	})

	test.each([
		{ provider: buyerEthereum, name: "web3" },
		{ provider: buyerEthersWeb3Provider1, name: "ethersWeb3Ethereum" },
		{ provider: buyerEthersEthereum1, name: "ethersEthereum" },
	])("should match order(buy erc1155 for erc20) with $name provider", async ({ provider }) => {
		//sender1 has ERC20, sender2 has ERC1155

		const tokenId = "999"
		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber(tokenId),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				value: toBigNumber("10"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		await sentTx(it.testErc20.methods.approve(it.erc20TransferProxy.options.address, toBn(10)), {
			from: buyerAddress,
		})

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const finalOrder = { ...left, signature }

		const startErc20Balance = toBn(await it.testErc20.methods.balanceOf(buyerAddress).call())
		const startErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())

		const marketplaceMarker = toBinary(`${ZERO_ADDRESS}00000001`)
		const getApis = getApisTemplate.bind(null, provider, env)

		const filler = new OrderFiller(provider, send, getConfig, getApis, getBaseOrderFee, env, {
			marketplaceMarker,
		})
		const tx = await filler.buy({ order: finalOrder, amount: 1, payouts: [], originFees: [] })
		await tx.wait()
		const matchEvent = (await tx.getEvents()).find(e => e.event === "Match")
		expect(matchEvent).toBeTruthy()
		expect(matchEvent?.returnValues).toBeTruthy()

		const finishErc20Balance = toBn(await it.testErc20.methods.balanceOf(buyerAddress).call())
		const finishErc1155Balance = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())

		expect(startErc20Balance.minus(finishErc20Balance).toString()).toBe("2")
		expect(finishErc1155Balance.minus(startErc1155Balance).toString()).toBe("1")
	})

	test("get transaction data", async () => {
		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const finalOrder = { ...left, signature }
		const originFees = [{
			account: randomAddress(),
			value: 100,
		}]
		await filler.getTransactionData({ order: finalOrder, amount: 2, originFees })
		await filler.getBuyTx({
			request: { order: finalOrder, amount: 2, originFees },
			from: toAddress(await buyerEthereum.getFrom()),
		})
	})

	test("should match order(buy erc1155 for eth)", async () => {
		//sender1 has ETH, sender2 has ERC1155

		const tokenId = "3"
		await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber(tokenId),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const before1 = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call())
		const before2 = toBn(await it.testErc1155.methods.balanceOf(sellerAddress, tokenId).call())

		const finalOrder = { ...left, signature }
		const originFees = [{
			account: randomAddress(),
			value: 100,
		}]
		const tx = await filler.buy({ order: finalOrder, amount: 2, originFees })
		await tx.wait()

		expect(toBn(await it.testErc1155.methods.balanceOf(sellerAddress, tokenId).call()).toString()).toBe(
			before2.minus(2).toFixed()
		)
		expect(toBn(await it.testErc1155.methods.balanceOf(buyerAddress, tokenId).call()).toString()).toBe(
			before1.plus(2).toFixed()
		)
	})

	test("should match order(buy erc1155 for eth) with dataType=V2", async () => {
		await sentTx(it.testErc1155.methods.mint(sellerAddress, 4, 10, "0x"), { from: buyerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V2",
				payouts: [],
				originFees: [],
				isMakeFill: true,
			},
		}

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const before1 = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())
		const before2 = toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call())

		const finalOrder = { ...left, signature }
		const originFees = [{
			account: randomAddress(),
			value: 100,
		}]
		const tx = await filler.buy({ order: finalOrder, amount: 2, originFees })
		await tx.wait()

		expect(toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call()).toString()).toBe(
			before2.minus(2).toFixed()
		)
		expect(toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call()).toString()).toBe(
			before1.plus(2).toFixed()
		)
	})

	test("should match order(buy erc1155 for eth) with dataType=V3", async () => {
		await sentTx(it.testErc1155.methods.mint(sellerAddress, 5, 10, "0x"), { from: buyerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber("1"),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V3_SELL",
				payout: {
					value: 10000,
					account: sellerAddress,
				},
				originFeeFirst: undefined,
				originFeeSecond: undefined,
				maxFeesBasePoint: 200,
				marketplaceMarker: toWord("0x000000000000000000000000000000000000000000000000000000000000face"),
			},
		}

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const before1 = toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call())
		const before2 = toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call())

		console.log(before1.toString())
		console.log(before2.toString())

		const finalOrder = { ...left, signature }
		const tx = await filler.buy({
			order: finalOrder,
			amount: 2,
			originFeeFirst: {
				account: randomAddress(),
				value: 100,
			},
		})
		await tx.wait()

		expect(toBn(await it.testErc1155.methods.balanceOf(sellerAddress, 1).call()).toString()).toBe(
			before2.minus(2).toFixed()
		)
		expect(toBn(await it.testErc1155.methods.balanceOf(buyerAddress, 1).call()).toString()).toBe(
			before1.plus(2).toFixed()
		)
	})

	test("should fill order (buy) with crypto punks asset", async () => {
		const punkId = 43
		//Mint punks
		await sentTx(it.punksMarket.methods.getPunk(punkId), { from: sellerAddress })
		await it.testErc20.methods.mint(buyerAddress, 100).send({ from: buyerAddress, gas: 200000 })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "CRYPTO_PUNKS",
					contract: toAddress(it.punksMarket.options.address),
					tokenId: punkId,
				},
				value: toBigNumber("1"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		await sentTx(
			it.punksMarket.methods.offerPunkForSaleToAddress(
				punkId,
				0,
				toAddress(it.punksTransferProxy.options.address),
			),
			{ from: sellerAddress }
		)
		const signature = await signOrder(sellerEthereum, getConfig, left)


		const finalOrder = { ...left, signature }
		const tx = await filler.buy({ order: finalOrder, amount: 1, originFees: [] })
		await tx.wait()

		const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

		expect(ownerAddress.toLowerCase()).toBe(buyerAddress.toLowerCase())
	})

	test("should accept bid with crypto punks asset", async () => {
		const punkId = 50
		//Mint crypto punks
		await sentTx(it.punksMarket.methods.getPunk(punkId), { from: sellerAddress })
		await it.testErc20.methods.mint(buyerAddress, 100).send({ from: buyerAddress, gas: 200000 })

		const tx = await approveErc20(
			buyerEthereum,
			send,
			toAddress(it.testErc20.options.address),
			toAddress(buyerAddress),
			toAddress(it.erc20TransferProxy.options.address),
			toBigNumber("10")
		)
		await tx?.wait()

		const left: SimpleOrder = {
			maker: buyerAddress,
			make: {
				assetType: {
					assetClass: "ERC20",
					contract: toAddress(it.testErc20.options.address),
				},
				value: toBigNumber("1"),
			},
			take: {
				assetType: {
					assetClass: "CRYPTO_PUNKS",
					contract: toAddress(it.punksMarket.options.address),
					tokenId: punkId,
				},
				value: toBigNumber("1"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		const signature = await signOrder(buyerEthereum, getConfig, left)

		const finalOrder = { ...left, signature }

		const filler = new OrderFiller(sellerEthereum, send, getConfig, getApisSeller, getBaseOrderFee, env)

		await filler.acceptBid({ order: finalOrder, amount: 1, originFees: [] })

		const ownerAddress = await it.punksMarket.methods.punkIndexToAddress(punkId).call()

		expect(ownerAddress.toLowerCase()).toBe(buyerAddress.toLowerCase())
	})

	test("buy erc-1155 <-> ETH with calldata flag", async () => {
		const tokenId = "5"
		await sentTx(it.testErc1155.methods.mint(sellerAddress, tokenId, 10, "0x"), { from: buyerAddress })

		const left: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(it.testErc1155.options.address),
					tokenId: toBigNumber(tokenId),
				},
				value: toBigNumber("5"),
			},
			maker: sellerAddress,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}

		const signature = await signOrder(sellerEthereum, getConfig, left)

		const finalOrder = { ...left, signature }

		await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address, true), {
			from: sellerAddress,
		})

		const marketplaceMarker = toBinary(`${ZERO_ADDRESS}00000001`)
		const sdkBuyer = createRaribleSdk(buyerEthereum, env, {
			marketplaceMarker,
		})
		const tx = await sdkBuyer.order.buy({ order: finalOrder, amount: 2, originFees: [] })
		expect(tx.data.endsWith(marketplaceMarker.concat(FILL_CALLDATA_TAG).slice(2))).toBe(true)
		await tx.wait()
	})
})
