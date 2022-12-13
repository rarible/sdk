import type {
	FTAssetType, OrderDataRequest, TezosProvider, XTZAssetType,
} from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import {
	AssetTypeV2,
	// eslint-disable-next-line camelcase
	get_ft_type,
	// eslint-disable-next-line camelcase
} from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import BigNumber from "bignumber.js"
import type { OrderFormV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import { sellV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import type { OrderId } from "@rarible/api-client"
import { Warning } from "@rarible/logger/build"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import type {
	OrderUpdateRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import type { RequestCurrencyAssetType } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { IApisSdk } from "../../domain"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import type { SellUpdateSimplifiedRequest } from "../../types/order/sell/simplified"
import { convertDateToTimestamp } from "../../common/get-expiration-date"
import { checkPayouts } from "../../common/check-payouts"
import type { MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertUnionParts,
	convertTezosOrderId,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosAddress,
	getTezosAssetTypeV2,
	getTezosItemData,
	getRequestAmount,
	checkChainId,
} from "./common"
import { getCollectionType } from "./common/get-collection-type"

export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
	) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
		this.sellUpdateBasic = this.sellUpdateBasic.bind(this)
		this.sellBasic = this.sellBasic.bind(this)
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

	async sell(): Promise<PrepareSellInternalResponse> {
		await checkChainId(this.provider)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				return this.sellV2(request)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			supportsExpirationDate: false,
			submit,
		}
	}

	async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
		return this.sellV2(request)
	}

	async sellUpdateBasic(request: SellUpdateSimplifiedRequest): Promise<OrderId> {
		const prepareResponse = await this.update({ orderId: request.orderId })
		return prepareResponse.submit({ price: request.price })
	}

	async sellV2(request: OrderCommon.OrderInternalRequest): Promise<OrderId> {
		await checkChainId(this.provider)
		checkPayouts(request.payouts)

		const provider = getRequiredProvider(this.provider)
		const { contract, tokenId } = getTezosItemData(request.itemId)

		const requestCurrency = getCurrencyAssetType(request.currency)

		const expirationDate = convertDateToTimestamp(request.expirationDate)
		const collectionType = await getCollectionType(this.provider, contract)

		const asset = await getTezosAssetTypeV2(provider.config, requestCurrency)
		const tezosRequest: OrderFormV2 = {
			s_asset_contract: contract,
			s_asset_token_id: new BigNumber(tokenId),
			s_sale_type: asset.type,
			s_sale_asset_contract: asset.asset_contract,
			s_sale_asset_token_id: asset.asset_token_id,
			s_sale: {
				sale_amount: new BigNumber(request.price),
				sale_asset_qty: getRequestAmount(request.amount, collectionType) || new BigNumber(1),
				sale_max_fees_base_boint: 10000,
				sale_end: expirationDate,
				sale_start: undefined,
				sale_origin_fees: convertUnionParts(request.originFees),
				sale_payouts: convertUnionParts(request.payouts),
				sale_data: undefined,
				sale_data_type: undefined,
			},
		}
		const sellOrderId = await sellV2(
			provider,
			tezosRequest
		)

		if (!sellOrderId) {
			throw new Error("OrderID cannot be requested")
		}
		return convertTezosOrderId(sellOrderId)
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		await checkChainId(this.provider)

		const order = await this.unionAPI.order.getOrderById({ id: request.orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}
		if (order.data["@type"] === "TEZOS_RARIBLE_V2") {
			throw new Warning("You can't change v1 version of order. Cancel order and create a new one")
		}
		const { make, take } = order
		const makeAssetType = make.type
		if (makeAssetType["@type"] !== "TEZOS_NFT" && makeAssetType["@type"] !== "TEZOS_MT") {
			throw new Error(`Order is not a sell (id=${request.orderId})`)
		}
		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const provider = getRequiredProvider(this.provider)
				const request: OrderDataRequest = {
					make_contract: convertFromContractAddress(makeAssetType.contract),
					make_token_id: new BigNumber(makeAssetType.tokenId),
					maker: getTezosAddress(order.maker),
					take_contract: "contract" in take.type ? convertFromContractAddress(take.type.contract) : undefined,
				}
				if (take.type["@type"] === "TEZOS_FT" && take.type.tokenId) {
					request.take_token_id = new BigNumber(take.type.tokenId.toString())
				}

				const asset = await getTezosAssetTypeV2(provider.config, take.type)
				const expirationDate = order.endedAt !== undefined ? Math.floor(new Date(order.endedAt).getTime()): undefined

				const tezosRequest: OrderFormV2 = {
					s_asset_contract: convertFromContractAddress(makeAssetType.contract),
					s_asset_token_id: new BigNumber(makeAssetType.tokenId),
					s_sale_type: asset.type,
					s_sale_asset_contract: request.take_contract,
					s_sale_asset_token_id: asset.asset_token_id,
					s_sale: {
						sale_amount: new BigNumber(updateRequest.price),
						sale_asset_qty: new BigNumber(make.value),
						sale_max_fees_base_boint: 10000,
						sale_end: expirationDate,
						sale_start: undefined,
						sale_origin_fees: order.data["@type"] === "TEZOS_RARIBLE_V2" ? convertUnionParts(order.data.originFees): [],
						sale_payouts: order.data["@type"] === "TEZOS_RARIBLE_V2" ? convertUnionParts(order.data.payouts): [],
						sale_data: undefined,
						sale_data_type: undefined,
					},
				}
				const sellOrderId = await sellV2(
					provider,
					tezosRequest
				)
				return convertTezosOrderId(sellOrderId)
			},
		})
		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit: updateAction,
		}
	}
}
