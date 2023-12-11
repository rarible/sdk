import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBinary, ZERO_ADDRESS } from "@rarible/types"
import type { Binary, Part } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toBn } from "@rarible/utils/build/bn"
import type { NftItemRoyalty } from "@rarible/ethereum-api-client/build/models/NftItemRoyalty"
import type { Address } from "@rarible/ethereum-api-client"
import { EthLooksRareOrderDataV2QuoteType } from "@rarible/api-client/build/models/OrderData"
import type { AssetType } from "@rarible/api-client/build/models/AssetType"
import type { OrderData } from "@rarible/api-client"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { EthereumNetwork } from "../../types"
import type { RaribleEthereumApis } from "../../common/apis"
import { createLooksrareV2Exchange } from "../contracts/looksrare-v2"
import { getRequiredWallet } from "../../common/get-required-wallet"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import { isNft } from "../is-nft"
import type { SimpleLooksrareV2Order } from "../types"
import { createLooksrareV2Validator } from "../contracts/looksrare-v2-validator"
import { convertUnionPartsToEVM, convertUnionRoyalties, createUnionItemId } from "../../common/union-converters"
import { convertISOStringToNumber } from "../../common"
import type { PreparedOrderRequestDataForExchangeWrapper, OrderFillSendData, LooksrareOrderV2FillRequest } from "./types"
import { ExchangeWrapperOrderType } from "./types"
import { calcValueWithFees, originFeeValueConvert } from "./common/origin-fees-utils"
import { addFeeDependsOnExternalFee, encodeDataWithRoyalties, getRoyaltiesAmount } from "./common/get-market-data"

export class LooksrareV2OrderHandler {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: OrderData["@type"]) => Promise<number>,
		private readonly env: EthereumNetwork,
		private readonly apis: RaribleEthereumApis,
	) {
	}

	convertMakerOrderToLooksrare(
		makerOrder: SimpleLooksrareV2Order,
		amount: BigNumberValue
	): LooksrareV2RawOrder {
		const { take, make } = makerOrder
		if (toBn(amount).gt(make.value)) {
			throw new Error(`Amount should be less or equal to ${make.value.toString()}`)
		}
		let contract: Address
		let tokenId: string
		if (isNft(make.type)) {
			contract = make.type.contract
			tokenId = make.type.tokenId.toString()
		} else {
			throw new Error(`Only sell orders are supported. Make=${make.type["@type"]} is not NFT`)
		}

		let currency: Address
		if (take.type["@type"] === "ETH") {
			currency = ZERO_ADDRESS
		} else if (take.type["@type"] === "ERC20") {
			currency = take.type.contract
		} else {
			throw new Error("Take asset should be ETH or ERC-20 contract")
		}

		if (!makerOrder.signature) {
			throw new Error("Signature is null")
		}

		return {
			quoteType: getQuoteType(makerOrder.data.quoteType),
			globalNonce: makerOrder.data.globalNonce,
			subsetNonce: makerOrder.data.subsetNonce,
			orderNonce: makerOrder.data.orderNonce,
			collection: contract,
			currency: currency,
			signer: makerOrder.maker,
			strategyId: makerOrder.data.strategyId,
			collectionType: getCollectionType(makerOrder.make.type),
			startTime: convertISOStringToNumber(makerOrder.startedAt) || 0,
			endTime: convertISOStringToNumber(makerOrder.endedAt) || 0,
			price: take.value,
			additionalParameters: toBinary(makerOrder.data.additionalParameters),
			amounts: [amount.toString()],
			itemIds: [tokenId],
		}
	}

	async prepareTransaction(
		request: LooksrareOrderV2FillRequest,
		originFees: Part[] | undefined,
	) {
		const wallet = getRequiredWallet(this.ethereum)
		if (!this.config.exchange.looksrareV2) {
			throw new Error("Looksrare V2 contract does not exist")
		}
		if (originFees && originFees.length > 1) {
			throw new Error("Origin fees recipients shouldn't be greater than 1")
		}
		const contract = createLooksrareV2Exchange(wallet, this.config.exchange.looksrareV2)

		const order = this.convertMakerOrderToLooksrare(request.order, request.amount)

		const method = order.quoteType === QuoteType.Ask ? "executeTakerBid" : "executeTakerAsk"

		if (!this.config.looksrareOrderValidatorV2) {
			throw new Error("Looksrare order validator V2 does not exist")
		}

		const validator = createLooksrareV2Validator(wallet, this.config.looksrareOrderValidatorV2)
		const merkleRoot = request.order.data.merkleRoot
			? { root: request.order.data.merkleRoot, proof: request.order.data.merkleProof }
			: { root: "0x0000000000000000000000000000000000000000000000000000000000000000", proof: [] }
		const validity = await validator.functionCall("checkMakerOrderValidity",
			order,
			request.order.signature,
			merkleRoot
		).call()
		const errorCodes = validity
			.filter((num: string) => !!+num)
			.map((num: string) => OrderValidatorCode[+num])

		if (errorCodes.length) {
			throw new Error(`Order validation errors: ${errorCodes.join(", ")}`)
		}
		const functionCall = contract.functionCall(
			method,
			//takerAsk
			{
				recipient: await wallet.getFrom(),
				additionalParameters: "0x",
			},
			//makerBid
			order,
			request.order.signature,
			//merkleTree,
			merkleRoot,
			originFees?.length && originFees[0] ? originFees[0]?.account : ZERO_ADDRESS
		)

		return {
			functionCall,
			rawOrder: order,
		}
	}


	async getTransactionDataForExchangeWrapper(
		request: LooksrareOrderV2FillRequest,
		originFees: Part[] | undefined,
		encodedFeesValue: BigNumber,
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		return (await this.prepareTransactionData(request, originFees, encodedFeesValue)).requestData
	}

	async getTransactionData(request: LooksrareOrderV2FillRequest): Promise<OrderFillSendData> {
		const { requestData, feeAddresses } = await this.prepareTransactionData(
			request,
			convertUnionPartsToEVM(request.originFees),
			undefined
		)

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
		request: LooksrareOrderV2FillRequest,
		originFees: Part[] | undefined,
		encodedFeesValue?: BigNumber,
	) {
		const { functionCall, rawOrder } = await this.prepareTransaction(request, originFees)

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
				const royalty = (await this.apis.nftItem.getItemRoyaltiesById({
					itemId: createUnionItemId(this.config.chainId, toAddress(rawOrder.collection), itemId),
				})).royalties.map(royalty => convertUnionRoyalties(royalty))

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

	getBaseOrderFee() {
		return this.getBaseOrderFeeConfig("ETH_LOOKSRARE_ORDER_DATA_V2")
	}

}

export type LooksrareV2RawOrder = {
	quoteType: QuoteType,
	globalNonce: string,
	subsetNonce: string,
	orderNonce: string,
	strategyId: number | string,
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
}

export enum QuoteType {
	Bid = 0,
	Ask = 1,
}

export enum StrategyType {
	standard = 0,
	collection = 1,
	collectionWithMerkleTree = 2,
}
export enum CollectionType {
	ERC721 = 0,
	ERC1155 = 1,
}

export const getTakerParamsTypes = (strategy: StrategyType): string[] => {
	if (strategy === StrategyType.standard) {
		return []
	}
	if (strategy === StrategyType.collection) {
		return ["uint256"] // Item id
	}
	if (strategy === StrategyType.collectionWithMerkleTree) {
		return ["uint256", "bytes32[]"] // Item id, merkle proof
	}
	return []
}

function getQuoteType(quoteType: EthLooksRareOrderDataV2QuoteType): QuoteType {
	if (quoteType === EthLooksRareOrderDataV2QuoteType.BID) {
		return QuoteType.Bid
	} else if (quoteType === EthLooksRareOrderDataV2QuoteType.ASK) {
		return QuoteType.Ask
	} else {
		throw new Error(`Unexpected QuoteType=${quoteType}`)
	}
}

function getCollectionType(asset: AssetType): CollectionType {
	if (asset["@type"] === "ERC721") {
		return CollectionType.ERC721
	} else if (asset["@type"] === "ERC1155") {
		return CollectionType.ERC1155
	} else {
		throw new Error(`Wrong collection type: ${asset["@type"]}, expected ERC721 or ERC1155`)
	}
}

export enum OrderValidatorCode {
	// 0. No error
	ORDER_EXPECTED_TO_BE_VALID = 0,

	// 1. Strategy & currency-related errors
	CURRENCY_NOT_ALLOWED = 101,
	STRATEGY_NOT_IMPLEMENTED = 111,
	STRATEGY_INVALID_QUOTE_TYPE = 112,
	STRATEGY_NOT_ACTIVE = 113,

	// 2. Maker order struct-related errors
	MAKER_ORDER_INVALID_STANDARD_SALE = 201,
	MAKER_ORDER_PERMANENTLY_INVALID_NON_STANDARD_SALE = 211,
	MAKER_ORDER_INVALID_CURRENCY_NON_STANDARD_SALE = 212,
	MAKER_ORDER_TEMPORARILY_INVALID_NON_STANDARD_SALE = 213,

	// 3. Nonce-related errors
	USER_SUBSET_NONCE_CANCELLED = 301,
	USER_ORDER_NONCE_EXECUTED_OR_CANCELLED = 311,
	USER_ORDER_NONCE_IN_EXECUTION_WITH_OTHER_HASH = 312,
	INVALID_USER_GLOBAL_BID_NONCE = 321,
	INVALID_USER_GLOBAL_ASK_NONCE = 322,

	// 4. errors related to signatures (EOA, EIP-1271) and merkle tree computations
	ORDER_HASH_PROOF_NOT_IN_MERKLE_TREE = 401,
	MERKLE_PROOF_PROOF_TOO_LARGE = 402,
	INVALID_SIGNATURE_LENGTH = 411,
	INVALID_S_PARAMETER_EOA = 412,
	INVALID_V_PARAMETER_EOA = 413,
	NULL_SIGNER_EOA = 414,
	INVALID_SIGNER_EOA = 415,
	MISSING_IS_VALID_SIGNATURE_FUNCTION_EIP1271 = 421,
	SIGNATURE_INVALID_EIP1271 = 422,

	// 5. Timestamp-related errors
	START_TIME_GREATER_THAN_END_TIME = 501,
	TOO_LATE_TO_EXECUTE_ORDER = 502,
	TOO_EARLY_TO_EXECUTE_ORDER = 503,

	// 6. Transfer-related (ERC20, ERC721, ERC1155 tokens), including transfers and approvals, errors.
	SAME_ITEM_ID_IN_BUNDLE = 601,
	ERC20_BALANCE_INFERIOR_TO_PRICE = 611,
	ERC20_APPROVAL_INFERIOR_TO_PRICE = 612,
	ERC721_ITEM_ID_DOES_NOT_EXIST = 621,
	ERC721_ITEM_ID_NOT_IN_BALANCE = 622,
	ERC721_NO_APPROVAL_FOR_ALL_OR_ITEM_ID = 623,
	ERC1155_BALANCE_OF_DOES_NOT_EXIST = 631,
	ERC1155_BALANCE_OF_ITEM_ID_INFERIOR_TO_AMOUNT = 632,
	ERC1155_IS_APPROVED_FOR_ALL_DOES_NOT_EXIST = 633,
	ERC1155_NO_APPROVAL_FOR_ALL = 634,

	// 7. Asset-type errors
	POTENTIAL_INVALID_COLLECTION_TYPE_SHOULD_BE_ERC721 = 701,
	POTENTIAL_INVALID_COLLECTION_TYPE_SHOULD_BE_ERC1155 = 702,

	// 8. Transfer manager-related errors
	NO_TRANSFER_MANAGER_APPROVAL_BY_USER_FOR_EXCHANGE = 801,
	TRANSFER_MANAGER_APPROVAL_REVOKED_BY_OWNER_FOR_EXCHANGE = 802,

	// 9. Creator fee-related errors
	BUNDLE_ERC2981_NOT_SUPPORTED = 901,
	CREATOR_FEE_TOO_HIGH = 902,
}
