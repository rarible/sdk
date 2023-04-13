import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toBinary, ZERO_ADDRESS } from "@rarible/types"
import type { Binary, Part } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toBn } from "@rarible/utils/build/bn"
import type { NftItemRoyalty } from "@rarible/ethereum-api-client/build/models/NftItemRoyalty"
import type { Address } from "@rarible/ethereum-api-client"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { SimpleOrder } from "../types"
import type { EthereumNetwork, IRaribleEthereumSdkConfig } from "../../types"
import type { RaribleEthereumApis } from "../../common/apis"
import { createLooksrareV2Exchange } from "../contracts/looksrare-v2"
import { getRequiredWallet } from "../../common/get-required-wallet"
import type { SimpleLooksrareOrder } from "../types"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import { isNft } from "../is-nft"
import type { LooksrareOrderFillRequest, PreparedOrderRequestDataForExchangeWrapper, OrderFillSendData } from "./types"
import type { MakerOrderWithVRS } from "./looksrare-utils/types"
import { ExchangeWrapperOrderType } from "./types"
import { calcValueWithFees, originFeeValueConvert } from "./common/origin-fees-utils"
import { addFeeDependsOnExternalFee, encodeDataWithRoyalties, getRoyaltiesAmount } from "./common/get-market-data"

export class LooksrareOrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly env: EthereumNetwork,
		private readonly apis: RaribleEthereumApis,
		// private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {
	}

	convertMakerOrderToLooksrare(makerOrder: SimpleLooksrareOrder, amount: BigNumberValue): LooksrareV2RawOrder {
		// if ("contract" in makerOrder.make.assetType) {
		// 	makerOrder.make.assetType.contract
		// }
		const { take, make } = makerOrder
		if (toBn(amount).gt(make.value)) {
			throw new Error(`Amount should be less or equal to ${make.value.toString()}`)
		}
		let contract: Address
		let tokenId: string
		if (isNft(make.assetType)) {
			contract = make.assetType.contract
			tokenId = make.assetType.tokenId.toString()
		} else {
			throw new Error(`Only sell orders are supported. Make=${make.assetType.assetClass} is not NFT`)
		}

		let currency: Address
		if (take.assetType.assetClass === "ETH") {
			currency = ZERO_ADDRESS
		} else if (take.assetType.assetClass === "ERC20") {
			currency = take.assetType.contract
		} else {
			throw new Error("Take asset should be ETH or ERC-20 contract")
		}

		if (!makerOrder.signature) {
			throw new Error("Signature is null")
		}

		const order = {
			quoteType: 1,
			globalNonce: "0",
			subsetNonce: "0",
			orderNonce: "2",
			collection: contract,
			currency: currency,
			signer: makerOrder.maker,
			strategyId: 0,
			collectionType: 0,
			startTime: makerOrder.start || 0,
			endTime: makerOrder.end || 0,
			price: take.value,
			additionalParameters: toBinary("0x"),
			signature: makerOrder.signature,
			merkleRoot: null,
			merkleProof: null,
			amounts: [amount.toString()],
			itemIds: [tokenId],
		}
		return order
	}

	async prepareTransaction(
		request: LooksrareOrderFillRequest,
		// originFees: Part[] | undefined,
	) {
		const wallet = getRequiredWallet(this.ethereum)
		if (!this.config.exchange.looksrareV2) {
			throw new Error("Looksrare V2 contract does not exist")
		}
		if (request.originFees && request.originFees.length > 1) {
			throw new Error("Origin fees recipients shouldn't be greater than 1")
		}
		const contract = createLooksrareV2Exchange(wallet, this.config.exchange.looksrareV2)

		const order = this.convertMakerOrderToLooksrare(request.order, request.amount)

		const functionCall = contract.functionCall(
			"executeTakerBid",
			//takerAsk
			{
				recipient: await wallet.getFrom(),
				additionalParameters: "0x",
			},
			//makerBid
			{
				quoteType: order.quoteType,
				globalNonce: order.globalNonce,
				subsetNonce: order.subsetNonce,
				orderNonce: order.orderNonce,
				strategyId: order.strategyId,
				collectionType: order.collectionType,
				collection: order.collection,
				currency: order.currency,
				signer: order.signer,
				startTime: order.startTime,
				endTime: order.endTime,
				price: order.price,
				itemIds: order.itemIds,
				amounts: order.amounts,
				additionalParameters: order.additionalParameters,
			},
			order.signature,
			//merkleTree,
			order.merkleRoot
				? { root: order.merkleRoot, proof: order.merkleProof }
				: { root: "0x0000000000000000000000000000000000000000000000000000000000000000", proof: [] },
			ZERO_ADDRESS
		)

		return {
			functionCall,
			rawOrder: order,
		}
	}


	async getTransactionDataForExchangeWrapper(
		request: LooksrareOrderFillRequest,
		originFees: Part[] | undefined,
		encodedFeesValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		return (await this.prepareTransactionData(request, originFees, encodedFeesValue)).requestData
	}

	async getTransactionData(request: LooksrareOrderFillRequest): Promise<OrderFillSendData> {
		const { requestData, feeAddresses } = await this.prepareTransactionData(request, request.originFees, undefined)

		const provider = getRequiredWallet(this.ethereum)
		const wrapperContract = createExchangeWrapperContract(provider, this.config.exchange.wrapper)

		const functionCall = wrapperContract.functionCall(
			"singlePurchase",
			requestData.data,
			feeAddresses[0],
			feeAddresses[1]
		)
		return {
			functionCall,
			options: {
				value: requestData.options.value.toString(),
			},
		}
	}

	async prepareTransactionData(
		request: LooksrareOrderFillRequest,
		originFees: Part[] | undefined,
		encodedFeesValue?: BigNumber,
	) {
		const { functionCall, rawOrder } = await this.prepareTransaction(request)

		const price = rawOrder.price.toString()
		const { totalFeeBasisPoints, encodedFeesValue: localEncodedFee, feeAddresses } = originFeeValueConvert(originFees)
		let valueWithOriginFees = calcValueWithFees(toBigNumber(price), totalFeeBasisPoints)

		const feeEncodedValue = encodedFeesValue ?? localEncodedFee

		const data = {
			marketId: ExchangeWrapperOrderType.LOOKSRARE_V2_ORDERS,
			amount: price,
			fees: feeEncodedValue,
			data: await functionCall.getData(),
		}

		if (request.addRoyalty) {
			let royaltyList: NftItemRoyalty[] = []

			for (const itemId of rawOrder.itemIds) {
				const royalty = (await this.apis.nftItem.getNftItemRoyaltyById({
					itemId: `${rawOrder.collection}:${itemId}`,
				})).royalty
				if (royalty?.length) {
					royaltyList = royaltyList.concat(royalty)
				}
			}

			if (royaltyList?.length) {
				data.data = encodeDataWithRoyalties({
					royalties: royaltyList,
					data: await functionCall.getData(),
					provider: getRequiredWallet(this.ethereum),
				})
				const royaltiesAmount = getRoyaltiesAmount(
					royaltyList,
					price ?? 0
				)
				valueWithOriginFees = toBn(valueWithOriginFees.plus(royaltiesAmount).toString())

				data.fees = addFeeDependsOnExternalFee(request.originFees, encodedFeesValue)
			}
		}

		return {
			requestData: {
				data: data,
				options: { value: valueWithOriginFees.toString() },
			},
			feeAddresses,
		}
	}
}

export type LooksrareV2RawOrder = {
	quoteType: QuoteType,
	globalNonce: string,
	subsetNonce: string,
	orderNonce: string,
	strategyId: number,
	collectionType: number,
	collection: string,
	currency: string,
	signer: string,
	startTime: number,
	endTime: number,
	price: string,
	itemIds: string[],
	amounts: string[],
	additionalParameters: Binary,
	signature: string
	merkleRoot: string | null
	merkleProof: Array<{ position: number, value: string }> | null
}

export enum QuoteType {
	Bid = 0,
	Ask = 1,
}
