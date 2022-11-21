import type { Address, Asset, Binary, Erc1155AssetType, Erc721AssetType, Part } from "@rarible/ethereum-api-client"
import { OrderOpenSeaV1DataV1Side } from "@rarible/ethereum-api-client"
import type {
	Ethereum,
	EthereumContract,
	EthereumFunctionCall,
	EthereumSendOptions,
	EthereumTransaction,
} from "@rarible/ethereum-provider"
import { toAddress, toBigNumber, toBinary, toWord, ZERO_ADDRESS } from "@rarible/types"
import type { BigNumber } from "@rarible/types"
import { backOff } from "exponential-backoff"
import { BigNumber as BigNum, toBn } from "@rarible/utils"
import type { OrderOpenSeaV1DataV1 } from "@rarible/ethereum-api-client/build/models/OrderData"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import { createOpenseaProxyRegistryEthContract } from "../contracts/proxy-registry-opensea"
import { approveErc20 } from "../approve-erc20"
import { approveErc721 } from "../approve-erc721"
import { approveErc1155 } from "../approve-erc1155"
import { getAssetWithFee } from "../get-asset-with-fee"
import { createOpenseaContract } from "../contracts/exchange-opensea-v1"
import { toVrs } from "../../common/to-vrs"
import { waitTx } from "../../common/wait-tx"
import type { SimpleOpenSeaV1Order, SimpleOrder } from "../types"
import { getRequiredWallet } from "../../common/get-required-wallet"
import { getErc721Contract } from "../../nft/contracts/erc721"
import { ERC721VersionEnum } from "../../nft/contracts/domain"
import { createMerkleValidatorContract } from "../contracts/merkle-validator"
import { createErc1155Contract } from "../contracts/erc1155"
import type { RaribleEthereumApis } from "../../common/apis"
import type { EVMBlockchain } from "../../common/get-blockchain-from-chain-id"
import { getBlockchainFromChainId } from "../../common/get-blockchain-from-chain-id"
import type { EthereumNetworkConfig, IRaribleEthereumSdkConfig } from "../../types"
import { id32 } from "../../common/id"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import type { OpenSeaOrderDTO } from "./open-sea-types"
import type {
	OpenSeaV1OrderFillRequest,
	OrderFillSendData,
	OrderHandler,
	PreparedOrderRequestDataForExchangeWrapper,
} from "./types"
import { ExchangeWrapperOrderType } from "./types"
import {
	convertOpenSeaOrderToDTO,
	ERC1155_MAKE_REPLACEMENT,
	ERC1155_TAKE_REPLACEMENT,
	ERC1155_VALIDATOR_MAKE_REPLACEMENT,
	ERC1155_VALIDATOR_TAKE_REPLACEMENT,
	ERC721_MAKE_REPLACEMENT,
	ERC721_TAKE_REPLACEMENT,
	ERC721_VALIDATOR_MAKE_REPLACEMENT,
	ERC721_VALIDATOR_TAKE_REPLACEMENT,
} from "./open-sea-converter"
import { originFeeValueConvert } from "./common/origin-fees-utils"
import { getUpdatedCalldata } from "./common/get-updated-call"

export type EncodedOrderCallData = { callData: Binary, replacementPattern: Binary, target: Address }

export class OpenSeaOrderHandler implements OrderHandler<OpenSeaV1OrderFillRequest> {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly apis: RaribleEthereumApis,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {}

	getOrderMetadata() {
		const blockchain = getBlockchainFromChainId(this.config.chainId)
		const ethereumNetworkConfig = getEthereumNetworkConfig(blockchain, this.sdkConfig)

		if (ethereumNetworkConfig && ethereumNetworkConfig.openseaOrdersMetadata) {
			return toWord(ethereumNetworkConfig.openseaOrdersMetadata)
		}
		return this.config.openSea.metadata || id32("RARIBLE")
	}

	async invert({ order, payouts }: OpenSeaV1OrderFillRequest, maker: Address): Promise<SimpleOpenSeaV1Order> {
		if (order.data.side === "BUY") {
			throw new Error("Bid opensea orders is not supported yet")
		}

		if (order.data.feeRecipient === ZERO_ADDRESS) {
			throw new Error("feeRecipient should be specified")
		}

		const data: OrderOpenSeaV1DataV1 = {
			...order.data,
			feeRecipient: ZERO_ADDRESS,
			side: OrderOpenSeaV1DataV1Side.BUY,
		}
		const invertedOrder: SimpleOpenSeaV1Order = {
			...order,
			make: {
				...order.take,
			},
			take: {
				...order.make,
			},
			/**
			 * if orders is not bid(for now opensea orders can be only regular sell type) - payouts(for nft asset)
			 * should have single recipient
			 */
			maker: payouts && payouts[0]?.account ? payouts[0].account : maker,
			taker: order.maker,
			signature: undefined,
			data,
		}
		invertedOrder.data = {
			...invertedOrder.data,
			...(await this.encodeOrder(invertedOrder)),
		}

		return invertedOrder
	}


	async encodeOrder(order: SimpleOpenSeaV1Order): Promise<EncodedOrderCallData> {
		const makeAssetType = order.make.assetType
		const takeAssetType = order.take.assetType

		const validatorAddress = order.data.target && order.data.target === this.config.openSea.merkleValidator
			? order.data.target
			: undefined

		if (makeAssetType.assetClass === "ERC721") {
			return this.getErc721EncodedData(makeAssetType, order.maker, true, validatorAddress, order.data.callData)
		} else if (makeAssetType.assetClass === "ERC1155") {
			return this.getErc1155EncodedData(makeAssetType, order.make.value, order.maker, true, validatorAddress)
		} else if (takeAssetType.assetClass === "ERC721") {
			return this.getErc721EncodedData(takeAssetType, order.maker, false, validatorAddress, order.data.callData)
		} else if (takeAssetType.assetClass === "ERC1155") {
			return this.getErc1155EncodedData(takeAssetType, order.take.value, order.maker, false, validatorAddress)
		} else {
			throw new Error("should never happen")
		}
	}

	async getErc721EncodedData(
		assetType: Erc721AssetType, maker: Address, isSellSide: boolean,
		validatorAddress: Address | undefined,  initialCalldata: Binary
	): Promise<EncodedOrderCallData> {
		const ethereum = getRequiredWallet(this.ethereum)
		let startArgs = [maker, ZERO_ADDRESS]
		if (!isSellSide) {
			startArgs = [ZERO_ADDRESS, maker]
		}

		if (validatorAddress) {
			const c = createMerkleValidatorContract(ethereum, validatorAddress)
			const isSafeV3Method = initialCalldata.startsWith(MATCH_ERC721_SAFE_TRANSFER_SIGNATURE)
			const callMethod = isSafeV3Method ? "matchERC721WithSafeTransferUsingCriteria" : "matchERC721UsingCriteria"

			const methodArgs = [...startArgs, assetType.contract, assetType.tokenId, "0x", []]
			return {
				replacementPattern: isSellSide ? ERC721_VALIDATOR_MAKE_REPLACEMENT : ERC721_VALIDATOR_TAKE_REPLACEMENT,
				callData: toBinary(await c.functionCall(callMethod, ...methodArgs).getData()),
				target: validatorAddress,
			}
		} else {

			let callData: Binary
			const transferArgs = [...startArgs, assetType.tokenId]
			const isSafeV3Method = initialCalldata.startsWith(SAFE_TRANSFER_SIGNATURE)
			if (isSafeV3Method) {
				const c = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, assetType.contract)
				callData = toBinary(await c.functionCall("safeTransferFrom", ...transferArgs).getData())
			} else {
				const c = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, assetType.contract)
				callData = toBinary(await c.functionCall("transferFrom", ...transferArgs).getData())
			}
			return {
				replacementPattern: isSellSide ? ERC721_MAKE_REPLACEMENT : ERC721_TAKE_REPLACEMENT,
				target: assetType.contract,
				callData,
			}
		}
	}

	async getErc1155EncodedData(
		assetType: Erc1155AssetType, value: BigNumberValue, maker: Address,
		isSellSide: boolean, validatorAddress: Address | undefined
	): Promise<EncodedOrderCallData> {
		const ethereum = getRequiredWallet(this.ethereum)
		let startArgs = [maker, ZERO_ADDRESS]
		if (!isSellSide) {
			startArgs = [ZERO_ADDRESS, maker]
		}
		if (validatorAddress) {
			const c = createMerkleValidatorContract(ethereum, validatorAddress)
			const methodArgs = [...startArgs, assetType.contract, assetType.tokenId, value, "0x", []]
			return {
				replacementPattern: isSellSide ? ERC1155_VALIDATOR_MAKE_REPLACEMENT : ERC1155_VALIDATOR_TAKE_REPLACEMENT,
				target: validatorAddress,
				callData: toBinary(await c.functionCall("matchERC1155UsingCriteria", ...methodArgs).getData()),
			}
		} else {
			const c = createErc1155Contract(ethereum, assetType.contract)
			const methodArgs = [...startArgs, assetType.tokenId, value, "0x"]
			return {
				replacementPattern: isSellSide ? ERC1155_MAKE_REPLACEMENT : ERC1155_TAKE_REPLACEMENT,
				target: assetType.contract,
				callData: toBinary(await c.functionCall("safeTransferFrom", ...methodArgs).getData()),
			}
		}
	}

	async getBaseOrderFee(): Promise<number> {
		return this.getBaseOrderFeeConfig("OPEN_SEA_V1")
	}

	getOrderFee(order: SimpleOpenSeaV1Order): number {
		if (order.data.feeRecipient === ZERO_ADDRESS) {
			return toBn(order.data.takerProtocolFee).plus(order.data.takerRelayerFee).toNumber()
		} else {
			return toBn(order.data.makerProtocolFee).plus(order.data.makerRelayerFee).toNumber()
		}
	}

	async approve(order: SimpleOpenSeaV1Order, infinite: boolean) {
		const fee = this.getOrderFee(order)
		if (order.data.side === "BUY") {
			const assetWithFee = getAssetWithFee(order.make, fee)
			await waitTx(this.approveSingle(order.maker, assetWithFee, infinite))
		} else {
			await waitTx(this.approveSingle(order.maker, order.make, infinite))
			const value = toBn(order.take.value)
				.multipliedBy(fee)
				.dividedBy(10000)
				.integerValue(BigNum.ROUND_FLOOR)
				.toFixed()
			const feeOnly: Asset = {
				...order.take,
				value: toBigNumber(value),
			}
			await waitTx(this.approveSingle(order.maker, feeOnly, infinite))
		}
	}

	async getTransactionData(
		initial: SimpleOpenSeaV1Order, inverted: SimpleOpenSeaV1Order, request: OpenSeaV1OrderFillRequest
	): Promise<OrderFillSendData> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const isTakeEth = initial.take.assetType.assetClass === "ETH"

		const atomicMatchFunctionCall = await this.getAtomicMatchFunctionCall(initial, inverted)

		const { buy } = getBuySellOrders(initial, inverted)

		if (isTakeEth) {
			const openseaWrapperContract = createExchangeWrapperContract(this.ethereum, this.config.exchange.wrapper)
			const { encodedFeesValue, feeAddresses } = originFeeValueConvert(request.originFees)
			const { data, options } = await this.getTransactionDataForExchangeWrapper(
				initial,
				inverted,
				request.originFees,
				encodedFeesValue,
			)

			const functionCall = openseaWrapperContract.functionCall(
				"singlePurchase",
				data,
				feeAddresses[0], feeAddresses[1],
			)

			return {
				functionCall,
				options: {
					...options,
					additionalData: getUpdatedCalldata(this.sdkConfig),
				},
			}
		} else {
			const options = {
				...await getMatchOpenseaOptions(buy),
				additionalData: getUpdatedCalldata(this.sdkConfig),
			}

			return {
				functionCall: atomicMatchFunctionCall,
				options,
			}
		}
	}

	async getTransactionDataForExchangeWrapper(
		initial: SimpleOpenSeaV1Order,
		inverted: SimpleOpenSeaV1Order,
		originFees: Part[] | undefined,
		feeValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		const atomicMatchFunctionCall = await this.getAtomicMatchFunctionCall(initial, inverted)
		const { buy } = getBuySellOrders(initial, inverted)
		return {
			data: {
				marketId: ExchangeWrapperOrderType.OPENSEA_V1,
				amount: (await getMatchOpenseaOptions(buy)).value!,
				fees: feeValue,
				data: await atomicMatchFunctionCall.getData(),
			},
			options: await getMatchOpenseaOptions(buy, originFees),
		}
	}

	async getAtomicMatchFunctionCall(
		initial: SimpleOpenSeaV1Order,
		inverted: SimpleOpenSeaV1Order,
	): Promise<EthereumFunctionCall> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const isTakeEth = initial.take.assetType.assetClass === "ETH"
		const { buy, sell } = getBuySellOrders(initial, inverted)
		const sellOrderToSignDTO = convertOpenSeaOrderToDTO(this.ethereum, sell)
		const buyOrderToSignDTO = convertOpenSeaOrderToDTO(this.ethereum, buy)

		const exchangeContract = createOpenseaContract(this.ethereum, initial.data.exchange)

		const buyVRS = toVrs(buy.signature || "")
		const sellVRS = toVrs(sell.signature || "")

		const ordersCanMatch = await this.ordersCanMatch(exchangeContract, buyOrderToSignDTO, sellOrderToSignDTO, isTakeEth)

		if (!ordersCanMatch) {
			throw new Error("Orders cannot be matched")
		}

		return exchangeContract.functionCall(
			"atomicMatch_",
			this.getAddressesArrayForTransaction(buyOrderToSignDTO, sellOrderToSignDTO, isTakeEth),
			[...getAtomicMatchArgUints(buyOrderToSignDTO), ...getAtomicMatchArgUints(sellOrderToSignDTO)],
			[...getAtomicMatchArgCommonData(buyOrderToSignDTO), ...getAtomicMatchArgCommonData(sellOrderToSignDTO)],
			buyOrderToSignDTO.calldata,
			sellOrderToSignDTO.calldata,
			buyOrderToSignDTO.replacementPattern,
			sellOrderToSignDTO.replacementPattern,
			buyOrderToSignDTO.staticExtradata,
			sellOrderToSignDTO.staticExtradata,
			[buyVRS.v, sellVRS.v],
			[buyVRS.r, buyVRS.s, sellVRS.r, sellVRS.s, this.getOrderMetadata()],
		)
	}

	private async ordersCanMatch(
		exchangeContract: EthereumContract,
		buyOrderToSignDTO: OpenSeaOrderDTO,
		sellOrderToSignDTO: OpenSeaOrderDTO,
		isTakeEth: boolean
	) {
		const ordersCanMatch = await exchangeContract
			.functionCall(
				"ordersCanMatch_",
				this.getAddressesArrayForTransaction(buyOrderToSignDTO, sellOrderToSignDTO, isTakeEth),
				[...getAtomicMatchArgUints(buyOrderToSignDTO), ...getAtomicMatchArgUints(sellOrderToSignDTO)],
				[...getAtomicMatchArgCommonData(buyOrderToSignDTO), ...getAtomicMatchArgCommonData(sellOrderToSignDTO)],
				buyOrderToSignDTO.calldata,
				sellOrderToSignDTO.calldata,
				buyOrderToSignDTO.replacementPattern,
				sellOrderToSignDTO.replacementPattern,
				buyOrderToSignDTO.staticExtradata,
				sellOrderToSignDTO.staticExtradata
			).call()

		return !!ordersCanMatch
	}

	private getAddressesArrayForTransaction(
		buyOrderToSignDTO: OpenSeaOrderDTO,
		sellOrderToSignDTO: OpenSeaOrderDTO,
		isTakeEth: boolean
	): Address[] {
		return isTakeEth ?
			[...getAtomicMatchArgAddressesForOpenseaWrapper(sellOrderToSignDTO, this.config.exchange.wrapper)] :
			[...getAtomicMatchArgAddresses(buyOrderToSignDTO), ...getAtomicMatchArgAddresses(sellOrderToSignDTO)]
	}

	async sendTransaction(
		initial: SimpleOpenSeaV1Order,
		inverted: SimpleOpenSeaV1Order,
		request: OpenSeaV1OrderFillRequest
	): Promise<EthereumTransaction> {
		const { functionCall, options } = await this.getTransactionData(initial, inverted, request)
		return this.send(functionCall, options)
	}

	async approveSingle(
		maker: Address,
		asset: Asset,
		infinite: undefined | boolean = true,
	): Promise<EthereumTransaction | undefined> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		switch (asset.assetType.assetClass) {
			case "ERC20": {
				const contract = asset.assetType.contract
				const operator = this.config.transferProxies.openseaV1
				return approveErc20(this.ethereum, this.send, contract, maker, operator, asset.value, infinite)
			}
			case "ERC721": {
				const contract = asset.assetType.contract
				const proxyAddress = await this.getRegisteredProxy(maker)
				return approveErc721(this.ethereum, this.send, contract, maker, proxyAddress)
			}
			case "ERC1155": {
				const contract = asset.assetType.contract
				const proxyAddress = await this.getRegisteredProxy(maker)
				return approveErc1155(this.ethereum, this.send, contract, maker, proxyAddress)
			}
			default:
				return undefined
		}
	}

	private async getRegisteredProxy(maker: Address): Promise<Address> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const proxyRegistry = this.config.openSea.proxyRegistry
		const proxyRegistryContract = createOpenseaProxyRegistryEthContract(this.ethereum, proxyRegistry)
		const proxyAddress = await getSenderProxy(proxyRegistryContract, maker)

		if (proxyAddress === ZERO_ADDRESS) {
			const registerTx = await proxyRegistryContract.functionCall("registerProxy").send()
			await registerTx.wait()

			return backOff(async () => {
				const value = await getSenderProxy(proxyRegistryContract, maker)
				if (value === ZERO_ADDRESS) {
					throw new Error("Expected non-zero proxy address")
				}
				return value
			}, {
				maxDelay: 500,
				numOfAttempts: 10,
				delayFirstAttempt: true,
				startingDelay: 100,
			})
		}

		return proxyAddress
	}
}

export async function getMatchOpenseaOptions(
	buy: SimpleOpenSeaV1Order, originFees?: Part[]
): Promise<EthereumSendOptions> {
	if (buy.make.assetType.assetClass === "ETH") {
		const origin = originFees?.map(f => f.value).reduce((v, acc) => v + acc, 0)
		const fee = toBn(buy.data.takerProtocolFee).plus(buy.data.takerRelayerFee).plus(origin || 0).toNumber()
		const assetWithFee = getAssetWithFee(buy.make, fee)
		return { value: assetWithFee.value }
	} else {
		return {}
	}
}

async function getSenderProxy(registryContract: EthereumContract, sender: Address) {
	return toAddress(await registryContract.functionCall("proxies", sender).call())
}

export function getBuySellOrders(left: SimpleOpenSeaV1Order, right: SimpleOpenSeaV1Order) {
	if (left.data.side === "SELL") {
		return {
			buy: right,
			sell: left,
		}
	} else {
		return {
			buy: left,
			sell: right,
		}
	}
}

export function getAtomicMatchArgAddresses(dto: OpenSeaOrderDTO) {
	return [dto.exchange, dto.maker, dto.taker, dto.feeRecipient, dto.target, dto.staticTarget, dto.paymentToken]
}

export function getAtomicMatchArgAddressesForOpenseaWrapper(sellDto: OpenSeaOrderDTO, openseaWrapper: Address) {
	return [
		sellDto.exchange,
		openseaWrapper,
		sellDto.maker,
		ZERO_ADDRESS,
		sellDto.target,
		sellDto.staticTarget,
		sellDto.paymentToken,
		...getAtomicMatchArgAddresses(sellDto),
	]
}

export function getAtomicMatchArgUints(dto: OpenSeaOrderDTO) {
	return [
		dto.makerRelayerFee,
		dto.takerRelayerFee,
		dto.makerProtocolFee,
		dto.takerProtocolFee,
		dto.basePrice,
		dto.extra,
		dto.listingTime,
		dto.expirationTime,
		dto.salt,
	]
}

export function getAtomicMatchArgCommonData(dto: OpenSeaOrderDTO) {
	return [dto.feeMethod, dto.side, dto.saleKind, dto.howToCall]
}

function getEthereumNetworkConfig(
	blockchain: EVMBlockchain, sdkConfig?: IRaribleEthereumSdkConfig
): EthereumNetworkConfig | void {
	if (!sdkConfig) {
		return
	}
	switch (blockchain) {
		case "ETHEREUM": return sdkConfig.ethereum
		case "POLYGON": return sdkConfig.polygon
		default: return
	}
}

const MATCH_ERC721_SAFE_TRANSFER_SIGNATURE = "0xc5a0236e"
const SAFE_TRANSFER_SIGNATURE = "0x42842e0e"
