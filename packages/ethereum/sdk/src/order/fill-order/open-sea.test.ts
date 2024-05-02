import {
	awaitAll,
	createGanacheProvider,
	deployMerkleValidator,
	deployOpenSeaExchangeV1,
	deployOpenseaProxyRegistry,
	deployOpenseaTokenTransferProxy,
	deployTestErc1155,
	deployTestErc20,
	deployTestErc721,
	deployTestExchangeWrapper,
} from "@rarible/ethereum-sdk-test-common"
import type { Address, Asset } from "@rarible/ethereum-api-client"
import { OrderOpenSeaV1DataV1Side, Platform } from "@rarible/ethereum-api-client"
import type { EthereumContract } from "@rarible/ethereum-provider"
import { toAddress, toBigNumber, toBinary, toWord, ZERO_ADDRESS } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { OPENSEA_EXCHANGE_ABI, proxyRegistryAbi, tokenTransferProxyAbi } from "@rarible/ethereum-sdk-test-common/src"
import type { Web3EthContractTypes } from "@rarible/web3-v4-ethereum"
import { Web3v4Ethereum, Web3 as Web3v4 } from "@rarible/web3-v4-ethereum"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import { getEthereumConfig } from "../../config"
import { id32 } from "../../common/id"
import {
	getAssetTypeBlank,
	getOrderSignature,
	getOrderTemplate,
	hashOpenSeaV1Order,
	hashToSign,
	OPENSEA_ORDER_TEMPLATE,
} from "../test/order-opensea"
import { createOpenseaProxyRegistryEthContract } from "../contracts/proxy-registry-opensea"
import { createOpenseaContract } from "../contracts/exchange-opensea-v1"
import { cancel } from "../cancel"
import type { SimpleOpenSeaV1Order } from "../types"
import { getApis as getApisTemplate } from "../../common/apis"
import { createRaribleSdk } from "../../index"
import { createErc721V3Collection } from "../../common/mint"
import type { ERC721RequestV3 } from "../../nft/mint"
import { MintResponseTypeEnum } from "../../nft/mint"
import { sentTx } from "../../common/test"
import { createE2eTestProvider } from "../../common/test/create-test-providers"
import {
	getAtomicMatchArgAddresses,
	getAtomicMatchArgCommonData,
	getAtomicMatchArgUints,
	OpenSeaOrderHandler,
} from "./open-sea"
import { convertOpenSeaOrderToDTO } from "./open-sea-converter"
import { OrderFiller } from "./index"

describe.skip("fillOrder: Opensea orders", function () {
	const { addresses, web3 } = createGanacheProvider()
	const [sender1Address, sender2Address, feeRecipient] = addresses
	const ethereum1 = new Web3v4Ethereum({ web3, from: sender1Address, gas: 1000000 })
	const ethereum2 = new Web3v4Ethereum({ web3, from: sender2Address, gas: 1000000 })
	const { provider: polygonProvider } = createE2eTestProvider(undefined, {
		networkId: 137,
		rpcUrl: "https://polygon-rpc.com",
	})

	const env = "dev-ethereum" as const
	const config: EthereumConfig = {
		...getEthereumConfig(env),
		openSea: {
			metadata: id32("RARIBLE"),
			proxyRegistry: ZERO_ADDRESS,
		},
	}
	const getConfig = async () => config
	const getBaseOrderFee = async () => 0

	const send1 = getSimpleSendWithInjects()
	const send2 = getSimpleSendWithInjects()
	const getApis1 = getApisTemplate.bind(null, ethereum1, env)
	const getApis2 = getApisTemplate.bind(null, ethereum2, env)

	const openSeaFillHandler1 = new OpenSeaOrderHandler(ethereum1, send1, getConfig, getApis1, getBaseOrderFee)
	const openSeaFillHandler2 = new OpenSeaOrderHandler(ethereum2, send2, getConfig, getApis2, getBaseOrderFee)
	const orderFiller1 = new OrderFiller(ethereum1, send1, getConfig, getApis1, getBaseOrderFee, "testnet")
	const orderFiller2 = new OrderFiller(ethereum2, send2, getConfig, getApis2, getBaseOrderFee, "testnet")

	const it = awaitAll({
		testErc20: deployTestErc20(web3, "Test1", "TST1"),
		testErc721: deployTestErc721(web3, "Test", "TST"),
		testErc1155: deployTestErc1155(web3, "Test"),
		merkleValidator: deployMerkleValidator(web3),
		exchangeWrapper: deployTestExchangeWrapper(web3),
	})

	let wyvernExchange: Web3EthContractTypes.Contract<typeof OPENSEA_EXCHANGE_ABI>
	let wyvernProxyRegistry: Web3EthContractTypes.Contract<typeof proxyRegistryAbi>
	let wyvernTokenTransferProxy: Web3EthContractTypes.Contract<typeof tokenTransferProxyAbi>
	let proxyRegistryEthContract: EthereumContract

	beforeAll(async () => {
		/**
		 * Configuring
		 */

		wyvernProxyRegistry = await deployOpenseaProxyRegistry(web3)
		console.log("deployed wyvernProxyRegistry", wyvernProxyRegistry.options.address)
		wyvernTokenTransferProxy = await deployOpenseaTokenTransferProxy(web3, wyvernProxyRegistry.options.address!)
		console.log("deployed wyvernTokenTransferProxy", wyvernTokenTransferProxy.options.address)

		wyvernExchange = await deployOpenSeaExchangeV1(
			web3,
			wyvernProxyRegistry.options.address!,
			wyvernTokenTransferProxy.options.address!,
			ZERO_ADDRESS, //ETH
			feeRecipient
		)
		console.log("deployed wyvernExchange", wyvernExchange.options.address)

		await sentTx(
			it.exchangeWrapper.methods.__ExchangeWrapper_init(
				wyvernExchange.options.address!,
				ZERO_ADDRESS,
			),
			{ from: sender1Address }
		)
		config.exchange.openseaV1 = toAddress(wyvernExchange.options.address!)
		config.openSea.proxyRegistry = toAddress(wyvernProxyRegistry.options.address!)
		config.transferProxies.openseaV1 = toAddress(wyvernTokenTransferProxy.options.address!)
		config.openSea.merkleValidator = toAddress(it.merkleValidator.options.address!)
		config.exchange.wrapper = toAddress(it.exchangeWrapper.options.address!)

		proxyRegistryEthContract = await createOpenseaProxyRegistryEthContract(
			ethereum1,
			toAddress(wyvernProxyRegistry.options.address!)
		)


		await sentTx(
			wyvernProxyRegistry.methods.registerProxy(),
			{ from: sender1Address }
		)
		await sentTx(
			wyvernProxyRegistry.methods.registerProxy(),
			{ from: sender2Address }
		)

		await proxyRegistryEthContract
			.functionCall("endGrantAuthentication", wyvernExchange.options.address)
			.send()

	})

	async function mintTestAsset(asset: Asset, sender: Address): Promise<any> {
		switch (asset.assetType.assetClass) {
			case "ERC20": {
				return await sentTx(
					it.testErc20.methods.mint(sender, toBn(asset.value).multipliedBy(10).toFixed()), { from: sender }
				)
			}
			case "ERC721": {
				return await sentTx(it.testErc721.methods.mint(sender, asset.assetType.tokenId, "0x"), { from: sender })
			}
			case "ERC1155": {
				return await sentTx(it.testErc1155.methods.mint(sender, asset.assetType.tokenId, toBn(asset.value).multipliedBy(10).toFixed(), "0x"), { from: sender })
			}
			default:
		}
	}

	async function getBalance(asset: Asset, sender: Address): Promise<string> {
		switch (asset.assetType.assetClass) {
			case "ETH": {
				return toBn(await ethereum1.getBalance(sender)).toString()
			}
			case "ERC20": {
				return toBn(await it.testErc20.methods.balanceOf(sender).call()).toString()
			}
			case "ERC721": {
				return toBn(await it.testErc721.methods.balanceOf(sender).call()).toString()
			}
			case "ERC1155": {
				return toBn(await it.testErc1155.methods.balanceOf(sender, asset.assetType.tokenId).call()).toString()
			}
			default: throw new Error("Should specify the ERC asset")
		}
	}

	function setTestContract(side: Asset): Asset {
		switch (side.assetType.assetClass) {
			case "ERC20": {
				return {
					...side,
					assetType: {
						...side.assetType,
						contract: toAddress(it.testErc20.options.address!),
					},
				}
			}
			case "ERC721": {
				return {
					...side,
					assetType: {
						...side.assetType,
						contract: toAddress(it.testErc721.options.address!),
					},
				}
			}
			case "ERC1155": {
				return {
					...side,
					assetType: {
						...side.assetType,
						contract: toAddress(it.testErc1155.options.address!),
					},
				}
			}

			default: return side
		}
	}

	test("mint polygon", async () => {
		const buyerWeb3 = new Web3v4Ethereum({ web3: new Web3v4(polygonProvider as any), gas: 1000000 })

		const sdkBuyer = createRaribleSdk(buyerWeb3, "polygon")

		const collection = toAddress("0x35f8aee672cdE8e5FD09C93D2BfE4FF5a9cF0756")
		const minter = toAddress("0xEE5DA6b5cDd5b5A22ECEB75b84C7864573EB4FeC")
		const nftTokenId = await sdkBuyer.apis.nftCollection.generateNftTokenId({ collection, minter })

		const tx = await sdkBuyer.nft.mint({
			collection: createErc721V3Collection(collection),
			uri: "ipfs://ipfs/hash",
			creators: [{
				account: minter,
				value: 10000,
			}],
			royalties: [],
			lazy: false,
			nftTokenId,
		} as ERC721RequestV3)

		console.log("tx", tx)
		if (tx.type === MintResponseTypeEnum.ON_CHAIN) {
			await tx.transaction.wait()
		}

	})

	test("should calculate valid hash", async () => {
		const exchangeContract = createOpenseaContract(ethereum1, toAddress(wyvernExchange.options.address!))

		const order: SimpleOpenSeaV1Order = {
			...OPENSEA_ORDER_TEMPLATE,
			make: getAssetTypeBlank("ERC721"),
			maker: toAddress(sender1Address),
			take: getAssetTypeBlank("ETH"),
			data: {
				...OPENSEA_ORDER_TEMPLATE.data,
				exchange: toAddress(wyvernExchange.options.address!),
				side: OrderOpenSeaV1DataV1Side.SELL,
			},
		}

		const orderHash = hashOpenSeaV1Order(ethereum1, order)
		const orderDTO = convertOpenSeaOrderToDTO(ethereum1, order)

		const contractCalculatedHash = await exchangeContract
			.functionCall(
				"hashOrder_",
				getAtomicMatchArgAddresses(orderDTO),
				getAtomicMatchArgUints(orderDTO),
				orderDTO.feeMethod,
				orderDTO.side,
				orderDTO.saleKind,
				orderDTO.howToCall,
				orderDTO.calldata,
				orderDTO.replacementPattern,
				orderDTO.staticExtradata
			)
			.call()

		expect(orderHash).toBe(contractCalculatedHash)
	})

	test("should orders be matchable", async () => {
		const { exchangeContract, buyDTO, sellDTO } = await prepareSimpleOrdersForTest()

		const ordersCanMatch = await exchangeContract
			.functionCall(
				"ordersCanMatch_",
				[...getAtomicMatchArgAddresses(buyDTO), ...getAtomicMatchArgAddresses(sellDTO)],
				[...getAtomicMatchArgUints(buyDTO), ...getAtomicMatchArgUints(sellDTO)],
				[...getAtomicMatchArgCommonData(buyDTO), ...getAtomicMatchArgCommonData(sellDTO)],
				buyDTO.calldata,
				sellDTO.calldata,
				buyDTO.replacementPattern,
				sellDTO.replacementPattern,
				buyDTO.staticExtradata,
				sellDTO.staticExtradata
			)
			.call()

		expect(ordersCanMatch).toBe(true)
	})

	test("should order price be correct", async () => {
		const { exchangeContract, buyDTO, sellDTO } = await prepareSimpleOrdersForTest()

		const orderMatchPrice = await exchangeContract
			.functionCall(
				"calculateMatchPrice_",
				[...getAtomicMatchArgAddresses(buyDTO), ...getAtomicMatchArgAddresses(sellDTO)],
				[...getAtomicMatchArgUints(buyDTO), ...getAtomicMatchArgUints(sellDTO)],
				[...getAtomicMatchArgCommonData(buyDTO), ...getAtomicMatchArgCommonData(sellDTO)],
				buyDTO.calldata,
				sellDTO.calldata,
				buyDTO.replacementPattern,
				sellDTO.replacementPattern,
				buyDTO.staticExtradata,
				sellDTO.staticExtradata
			)
			.call()

		expect(buyDTO.basePrice).toBe(orderMatchPrice)
	})

	test("get order signature", async () => {
		const order = {
			"maker": "0xe9b692278f7daf652db7eb092e9dedb13128c889",
			"salt": "0x000000000000000000000000000000000000000000000000000000000000000a",
			"type": "OPEN_SEA_V1",
			"start": 0,
			"end": 0,
			"data": {
				"dataType": "OPEN_SEA_V1_DATA_V1",
				"exchange": "0x82ad8b02c5380ce044da7ced96dc38c26154c56f",
				"makerRelayerFee": "0",
				"takerRelayerFee": "0",
				"makerProtocolFee": "0",
				"takerProtocolFee": "0",
				"feeRecipient": "0x0000000000000000000000000000000000000000",
				"feeMethod": "SPLIT_FEE",
				"side": "SELL",
				"saleKind": "FIXED_PRICE",
				"howToCall": "CALL",
				"callData": "0x",
				"replacementPattern": "0x",
				"staticTarget": "0x0000000000000000000000000000000000000000",
				"staticExtraData": "0x",
				"extra": "0",
			},
			"make": {
				"assetType": {
					"assetClass": "ERC721",
					"contract": "0x40807ff505f622a5d527e334608e706571c329a2",
					"tokenId": "77306650",
				},
				"value": "1",
			},
			"take": {
				"assetType": {
					"assetClass": "ETH",
				},
				"value": "100",
			},
		} as any
		console.log("JSON", JSON.stringify(order, null, "	"))

		const signature = toBinary(await getOrderSignature(ethereum1, order))
		const orderHash = hashOpenSeaV1Order(ethereum1, order)
		const signedHash = hashToSign(ethereum1, orderHash)
		console.log("sig", signature)
		console.log("signedHash", signedHash)
		expect(signature).toBe("0xa52af7ce5428c6b0ac183401849db6aea1e1d27ec26fb05dc2fb8d657c4fdd6e5002e8578fd8fee8d1647995a0f99cfbda44e22650c56d7f936feb7dcad709211b")
		expect(signedHash).toBe("0x45af7db9a0626744c737284e4c461516a31a7c7b5b7812a6047dfe9d09da25dc")
	})

	test("should cancel order", async () => {
		const order: SimpleOpenSeaV1Order = {
			...OPENSEA_ORDER_TEMPLATE,
			make: getAssetTypeBlank("ERC721"),
			maker: toAddress(sender1Address),
			take: getAssetTypeBlank("ETH"),
			data: {
				...OPENSEA_ORDER_TEMPLATE.data,
				exchange: toAddress(wyvernExchange.options.address!),
				side: OrderOpenSeaV1DataV1Side.SELL,
			},
		}
		await mintTestAsset(order.take, sender1Address)
		await mintTestAsset(order.make, sender2Address)
		order.make = setTestContract(order.make)
		order.take = setTestContract(order.take)
		await openSeaFillHandler2.approveSingle(sender2Address, order.make)

		const signature = toBinary(await getOrderSignature(ethereum1, order))

		const orderHash = hashOpenSeaV1Order(ethereum2, order)
		const signedHash = hashToSign(ethereum2, orderHash)

		const checkLazyOrder: any = async (form: any) => Promise.resolve(form)
		const cancelledOrder = await cancel(
			checkLazyOrder,
			ethereum1,
			send1,
			getConfig,
			getApis1,
			{
				...order,
				signature,
			},
		)

		const cancelEvent = (await cancelledOrder.getEvents()).find(e => e.event === "OrderCancelled")

		expect(cancelEvent).toHaveProperty("args.hash", signedHash)

	})

	test("get transaction data", async () => {
		const order: SimpleOpenSeaV1Order = {
			...OPENSEA_ORDER_TEMPLATE,
			make: getAssetTypeBlank("ERC721"),
			maker: toAddress(sender1Address),
			take: getAssetTypeBlank("ETH"),
			data: {
				...OPENSEA_ORDER_TEMPLATE.data,
				exchange: toAddress(wyvernExchange.options.address!),
				side: OrderOpenSeaV1DataV1Side.SELL,
				feeRecipient: toAddress(sender2Address),
			},
		}
		await mintTestAsset(order.take, sender1Address)
		await mintTestAsset(order.make, sender2Address)
		order.make = setTestContract(order.make)
		order.take = setTestContract(order.take)
	})

	test("get order origin without sdkConfig", async () => {
		const openSeaFillHandler1 = new OpenSeaOrderHandler(ethereum1, send1, getConfig, getApis1, getBaseOrderFee)
		expect(openSeaFillHandler1.getOrderMetadata()).toEqual(id32(Platform.RARIBLE))
	})

	test("get order origin with sdkConfig and passed ethereum platform", async () => {
		const meta = toWord(id32("CUSTOM_STRING"))
		const openSeaFillHandler1 = new OpenSeaOrderHandler(ethereum1, send1, getConfig, getApis1, getBaseOrderFee, {
			ethereum: {
				openseaOrdersMetadata: meta,
			},
		})
		expect(openSeaFillHandler1.getOrderMetadata()).toEqual(meta)
	})

	test("get order origin with passed polygon platform, but wallet still ethereum", async () => {
		const meta = toWord(id32("CUSTOM_STRING"))
		const openSeaFillHandler1 = new OpenSeaOrderHandler(ethereum1, send1, getConfig, getApis1, getBaseOrderFee, {
			polygon: {
				openseaOrdersMetadata: meta,
			},
		})
		expect(openSeaFillHandler1.getOrderMetadata()).toEqual(id32(Platform.RARIBLE))
	})

	test("get order origin with passed polygon platform and polygon wallet", async () => {
		const meta = toWord(id32("CUSTOM_STRING"))
		const web3 = new Web3v4(polygonProvider as any)
		const polygon1 = new Web3v4Ethereum({ web3 })
		const getApis = getApisTemplate.bind(null, polygon1, env)
		const openSeaFillHandler1 = new OpenSeaOrderHandler(polygon1, send1, getConfig, getApis, getBaseOrderFee, {
			polygon: {
				openseaOrdersMetadata: meta,
			},
		})
		expect(openSeaFillHandler1.getOrderMetadata()).toEqual(meta)
	})

	test("get order origin with passed polygon platform and polygon wallet", async () => {
		const meta = toWord(id32("CUSTOM_STRING"))
		const web3 = new Web3v4(polygonProvider as any)
		const polygon1 = new Web3v4Ethereum({ web3 })
		const getApis = getApisTemplate.bind(null, polygon1, env)
		const openSeaFillHandler1 = new OpenSeaOrderHandler(polygon1, send1, getConfig, getApis, getBaseOrderFee, {
			polygon: {
				openseaOrdersMetadata: meta,
			},
		})
		expect(openSeaFillHandler1.getOrderMetadata()).toEqual(meta)
	})

	// Sell-side orders
	describe.each([
		getOrderTemplate("ERC721", "ETH", OrderOpenSeaV1DataV1Side.SELL),
		getOrderTemplate("ERC721", "ERC20", OrderOpenSeaV1DataV1Side.SELL),
		getOrderTemplate("ERC1155", "ETH", OrderOpenSeaV1DataV1Side.SELL),
		getOrderTemplate("ERC1155", "ERC20", OrderOpenSeaV1DataV1Side.SELL),
	])(
		"side: $data.side $make.assetType.assetClass for $take.assetType.assetClass",
		(testOrder) => {
			let order: SimpleOpenSeaV1Order = testOrder
			const nftOwner = sender2Address
			const nftBuyer = sender1Address
			const nftOwnerEthereum = ethereum2

			beforeEach(async () => {
				order.make = setTestContract(order.make)
				order.take = setTestContract(order.take)
				order.data.takerRelayerFee = toBigNumber("500")
				order.data.takerProtocolFee = toBigNumber("500")
				order.data.makerRelayerFee = toBigNumber("500")
				order.data.makerProtocolFee = toBigNumber("500")
				order.data.exchange = toAddress(wyvernExchange.options.address!)
				order.data.feeRecipient = toAddress(feeRecipient)
				order.maker = toAddress(nftOwner)

				await mintTestAsset(order.make, nftOwner)
				await mintTestAsset(order.take, nftBuyer)
				await openSeaFillHandler2.approveSingle(nftOwner, order.make, false)
				await openSeaFillHandler2.approveSingle(nftOwner, order.take, false)

				order.signature = toBinary(await getOrderSignature(nftOwnerEthereum, order))

			})

			test("should match order", async () => {

				const nftSellerInitBalance = await getBalance(order.make, nftOwner)

				await orderFiller1.buy({ order })

				const nftSellerFinalBalance = await getBalance(order.make, nftOwner)

				expect(nftSellerFinalBalance).not.toBe(nftSellerInitBalance)

			})
		})

	// Buy-side orders
	describe.each([
		getOrderTemplate("ERC20", "ERC721", OrderOpenSeaV1DataV1Side.BUY),
		getOrderTemplate("ERC20", "ERC1155", OrderOpenSeaV1DataV1Side.BUY),
	])(
		"side: $data.side $make.assetType.assetClass for $take.assetType.assetClass",
		(testOrder) => {
			let order: SimpleOpenSeaV1Order = testOrder
			const nftOwner = sender2Address
			const nftBuyer = sender1Address
			const nftBuyerEthereum = ethereum1

			beforeEach(async () => {
				order.data.exchange = toAddress(wyvernExchange.options.address!)
				order.data.makerRelayerFee = toBigNumber("500")
				order.data.makerProtocolFee = toBigNumber("500")
				order.data.takerRelayerFee = toBigNumber("500")
				order.data.takerProtocolFee = toBigNumber("500")
				order.data.feeRecipient = feeRecipient
				order.maker = toAddress(nftBuyer)
				order.make = setTestContract(order.make)
				order.take = setTestContract(order.take)

				await mintTestAsset(order.take, nftOwner)
				await mintTestAsset(order.make, nftBuyer)
				const buyerApprovalAsset = {
					...order.make,
					value: toBigNumber(+order.data.takerRelayerFee + +order.data.takerProtocolFee + order.make.value),
				}
				await openSeaFillHandler1.approveSingle(nftBuyer, buyerApprovalAsset, false)

				order.signature = toBinary(await getOrderSignature(nftBuyerEthereum, order))
			})

			test("should match order", async () => {
				const nftSellerInitBalance = await getBalance(order.take, nftOwner)

				await orderFiller2.acceptBid({ order })

				const nftSellerFinalBalance = await getBalance(order.take, nftOwner)
				expect(nftSellerFinalBalance).not.toBe(nftSellerInitBalance)
			})
		})

	async function prepareSimpleOrdersForTest() {
		const exchangeContract = await createOpenseaContract(ethereum1, toAddress(wyvernExchange.options.address!))

		const sell: SimpleOpenSeaV1Order = {
			...OPENSEA_ORDER_TEMPLATE,
			make: getAssetTypeBlank("ERC721"),
			maker: toAddress(sender1Address),
			take: getAssetTypeBlank("ETH"),
			data: {
				...OPENSEA_ORDER_TEMPLATE.data,
				exchange: toAddress(wyvernExchange.options.address!),
				side: OrderOpenSeaV1DataV1Side.SELL,
				feeRecipient,
			},
		}
		const buy = await openSeaFillHandler1.invert({ order: sell }, sender1Address)
		const buyDTO = convertOpenSeaOrderToDTO(ethereum1, buy)
		const sellDTO = convertOpenSeaOrderToDTO(ethereum1, sell)

		return {
			exchangeContract,
			buyDTO,
			sellDTO,
		}
	}
})
