import { Action } from "@rarible/action"
import type { TezosNetwork, TezosProvider, FTAssetType, XTZAssetType } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { put_bid } from "@rarible/tezos-sdk/dist/bids"
import BigNumber from "bignumber.js"
import { toBigNumber, toOrderId } from "@rarible/types"
// eslint-disable-next-line camelcase
import { get_ft_type } from "@rarible/tezos-sdk/dist/main"
import { AssetTypeV2 } from "@rarible/tezos-common"
import { Warning } from "@rarible/logger/build"
import type { Bid } from "@rarible/tezos-sdk/dist/bids"
import type { Collection } from "@rarible/api-client"
import type { Item } from "@rarible/api-client/build/models"
import type { OrderId } from "@rarible/api-client"
import type {
	OrderRequest,
	OrderUpdateRequest,
} from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { PrepareOrderUpdateRequest } from "../../types/order/common"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type { PrepareBidUpdateResponse } from "../../types/order/bid/domain"
import type { RequestCurrencyAssetType } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import { notImplemented } from "../../common/not-implemented"
import { convertDateToTimestamp } from "../../common/get-expiration-date"
import type { IApisSdk } from "../../domain"
import type { BidSimplifiedRequest } from "../../types/order/bid/simplified"
import type { BidUpdateSimplifiedRequest } from "../../types/order/bid/simplified"
import { getNftContractAddress } from "../../common/utils"
import type { MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertUnionParts,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData,
	convertTezosToContractAddress,
	getTezosAssetTypeV2,
	isNftOrMTAssetType,
	convertUnionAddress,
} from "./common"

export class TezosBid {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: IApisSdk,
		private network: TezosNetwork,
	) {
		this.bid = this.bid.bind(this)
		this.bidBasic = this.bidBasic.bind(this)
		this.update = this.update.bind(this)
		this.updateBasic = this.updateBasic.bind(this)
	}

	async parseTakeAssetType(type: RequestCurrencyAssetType): Promise<XTZAssetType | FTAssetType> {
		switch (type["@type"]) {
			case "XTZ":
				return {
					asset_class: type["@type"],
				}
			case "TEZOS_FT": {
				const provider = getRequiredProvider(this.provider)
				const contract = convertFromContractAddress(type.contract)
				const ftType = await get_ft_type(provider.config, contract)
				return {
					asset_class: "FT",
					contract: contract,
					token_id: ftType === AssetTypeV2.FA2 ? new BigNumber(type.tokenId || 0) : undefined,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		const requestInfo = await this.getBidRequestInfo(prepare)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const provider = getRequiredProvider(this.provider)
				const commonBidData = {
					...(await this.getCommonBidData(request)),
					asset_contract: requestInfo.contract,
				}

				let orderId: string | undefined
				if ("itemId" in prepare) {
					if (requestInfo.tokenId === undefined) {
						throw new Warning("Check tokenId in your itemId parameter")
					}
					const bidRequest: Bid = {
						...commonBidData,
						asset_token_id: new BigNumber(requestInfo.tokenId),
					}
					orderId = await put_bid(provider, bidRequest)
				} else if ("collectionId" in prepare) {
					throw new Warning("Floor bids are not available yet")
					// const bidRequest: FloorBid = commonBidData
					// orderId = await put_floor_bid(provider, bidRequest)

				} else {
					throw new Warning("ItemId or CollectionId must be assigned")
				}

				if (!orderId) {
					throw new Error("OrderID cannot be requested")
				}

				return toOrderId(orderId)
			},
		})

		return {
			multiple: requestInfo.collection.type === "TEZOS_MT",
			maxAmount: "item" in requestInfo && requestInfo.item ? toBigNumber(requestInfo.item.supply) : null,
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			getConvertableValue: notImplemented,
			supportsExpirationDate: false,
			submit,
		}
	}

	async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
		const response = await this.bid(request)
		return response.submit(request)
	}

	async getCommonBidData(request: OrderRequest) {
		const provider = getRequiredProvider(this.provider)
		const requestCurrency = getCurrencyAssetType(request.currency)

		const asset = await getTezosAssetTypeV2(provider.config, requestCurrency)
		const nftAmount = new BigNumber(request.amount || 1)
		const assetTotalAmount = nftAmount.multipliedBy(request.price)
		// const assetTotalAmount = new BigNumber(request.price)
		return {
			bid_type: asset.type,
			bid_asset_contract: asset.asset_contract,
			bid_asset_token_id: asset.asset_token_id,
			bid: {
				bid_origin_fees: convertUnionParts(request.originFees),
				bid_payouts: await getPayouts(provider, request.payouts),
				bid_amount: assetTotalAmount,
				bid_asset_qty: nftAmount,
				bid_expiry_date: convertDateToTimestamp(request.expirationDate),
				bid_data_type: undefined,
				bid_data: undefined,
			},
		}
	}

	async updateBasic(request: BidUpdateSimplifiedRequest): Promise<OrderId> {
		const response = await this.update(request)
		return response.submit(request)
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		const order = await this.apis.order.getOrderById({ id: request.orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}

		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const provider = getRequiredProvider(this.provider)
				if (!isNftOrMTAssetType(order.take.type)) {
					throw new Warning("Non-bid order specified")
				}
				if (order.data["@type"] !== "TEZOS_RARIBLE_V3") {
					throw new Error("It's not TEZOS_RARIBLE_V3 order")
				}
				const asset = await getTezosAssetTypeV2(provider.config, order.make.type)
				const totalAssetAmount = new BigNumber(order.take.value).multipliedBy(updateRequest.price)
				const updateBidData = {
					asset_contract: convertFromContractAddress(order.take.type.contract),
					asset_token_id: new BigNumber(order.take.type.tokenId),
					bid_type: asset.type,
					bid_asset_contract: asset.asset_contract,
					bid_asset_token_id: asset.asset_token_id,
					bid: {
						bid_origin_fees: convertUnionParts(order.data.originFees),
						bid_payouts: await getPayouts(provider, order.data.payouts),
						bid_amount: totalAssetAmount,
						bid_asset_qty: new BigNumber(order.take.value),
						bid_expiry_date: order.endedAt !== undefined
							? convertDateToTimestamp(new Date(order.endedAt))
							: undefined,
						bid_data_type: undefined,
						bid_data: undefined,
					},
				}
				const orderId = await put_bid(provider, updateBidData)
				if (!orderId) {
					throw new Error("OrderID cannot be requested")
				}

				return toOrderId(orderId)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			getConvertableValue: notImplemented,
			submit: updateAction,
			orderData: {
				nftCollection: getNftContractAddress(order.take.type),
			},
		}
	}

	private async getBidRequestInfo(prepare: PrepareBidRequest): Promise<BidRequestInfo> {
		if ("itemId" in prepare) {
			const { contract, tokenId } = getTezosItemData(prepare.itemId)
			const [collection, item] = await Promise.all([
				this.apis.collection.getCollectionById({
					collection: convertTezosToContractAddress(contract),
				}),
				this.apis.item.getItemById({ itemId: prepare.itemId }),
			])
			return { contract, tokenId, collection, item }
		} else if ("collectionId" in prepare) {
			const collection = await this.apis.collection.getCollectionById({
				collection: prepare.collectionId,
			})
			return { contract: convertUnionAddress(prepare.collectionId), collection }
		} else {
			throw new Warning("ItemId or CollectionId must be assigned")
		}
	}
}

export type BidRequestInfo = {
	collection: Collection
	contract: string
	item?: Item
	tokenId?: string | undefined
}
