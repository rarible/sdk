import type { SellRequest as TezosSellRequest } from "@rarible/tezos-sdk/dist/order/sell"
import type { FTAssetType, OrderDataTypeRequest, TezosProvider, XTZAssetType, OrderForm } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { AssetTypeV2, fill_offchain_royalties, get_active_order_type, get_ft_type, OrderType, pk_to_pkh, upsert_order, sell } from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import BigNumber from "bignumber.js"
import type { OrderFormV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import { sellV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import type { OrderId } from "@rarible/api-client"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import type {
	OrderUpdateRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import { retry } from "../../common/retry"
import type { RequestCurrencyAssetType } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { IApisSdk } from "../../domain"
import type { TezosOrder } from "./domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertUnionParts, convertOrderToOrderForm,
	convertTezosOrderId,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosAddress,
	getTezosAssetTypeV2,
	getTezosItemData,
	getTokenIdString,
} from "./common"

export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private unionAPI: IApisSdk,
	) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
		this.sellV1 = this.sellV1.bind(this)
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
		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => this.sellV2(request),
		})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			supportsExpirationDate: false,
			submit,
		}
	}

	async sellV1(request: OrderCommon.OrderInternalRequest) {
		const provider = getRequiredProvider(this.provider)
		const makerPublicKey = await getMakerPublicKey(provider)
		const { itemId, contract } = getTezosItemData(request.itemId)

		const item = await retry(20, 1000, async () => {
			return this.apis.item.getNftItemById({ itemId })
		})
		const requestCurrency = getCurrencyAssetType(request.currency)

		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})
		const tezosRequest: TezosSellRequest = {
			maker: pk_to_pkh(makerPublicKey),
			maker_edpk: makerPublicKey,
			make_asset_type: {
				asset_class: itemCollection.type,
				contract: item.contract,
				token_id: new BigNumber(item.tokenId),
			},
			take_asset_type: await this.parseTakeAssetType(requestCurrency),
			amount: new BigNumber(request.amount),
			price: new BigNumber(request.price),
			payouts: await getPayouts(provider, request.payouts),
			origin_fees: convertUnionParts(request.originFees),
		}

		const sellOrder: TezosOrder = await sell(
    	provider,
    	tezosRequest
		)
		return convertTezosOrderId(sellOrder.hash)
	}

	async sellV2(request: OrderCommon.OrderInternalRequest): Promise<OrderId> {
		const provider = getRequiredProvider(this.provider)
		const { contract, tokenId } = getTezosItemData(request.itemId)

		const requestCurrency = getCurrencyAssetType(request.currency)

		const expirationDate = request.expirationDate instanceof Date
			? Math.floor(request.expirationDate.getTime() / 1000)
			: undefined

		const asset = await getTezosAssetTypeV2(provider.config, requestCurrency)
		console.log("exp date", expirationDate)
		const tezosRequest: OrderFormV2 = {
			s_asset_contract: contract,
			s_asset_token_id: new BigNumber(tokenId),
			s_sale_type: asset.type,
			s_sale_asset_contract: asset.asset_contract,
			s_sale_asset_token_id: asset.asset_token_id,
			s_sale: {
				sale_amount: new BigNumber(request.price),
				sale_asset_qty: new BigNumber(request.amount),
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
		const order = await this.unionAPI.order.getOrderById({ id: request.orderId })
		if (!order) {
			throw new Error("Order has not been found")
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
				const request: OrderDataTypeRequest = {
					contract: convertFromContractAddress(makeAssetType.contract),
					token_id: new BigNumber(makeAssetType.tokenId),
					seller: getTezosAddress(order.maker),
					buy_asset_contract: "contract" in take.type ? convertFromContractAddress(take.type.contract) : undefined,
					buy_asset_token_id: take.type["@type"] === "TEZOS_FT" ? getTokenIdString(take.type.tokenId) : undefined,
				}
				const type = await retry(30, 2000, async () => {
					const type = await get_active_order_type(this.provider.config, request)
					if (type === undefined) {
						throw new Error("Order type has not been not found")
					}
					return type
				})

				if (type === OrderType.V2) {
					const asset = await getTezosAssetTypeV2(provider.config, take.type)
					const expirationDate = order.endedAt !== undefined ? Math.floor(new Date(order.endedAt).getTime()): undefined

					const tezosRequest: OrderFormV2 = {
						s_asset_contract: request.contract,
						s_asset_token_id: new BigNumber(makeAssetType.tokenId),
						s_sale_type: asset.type,
						s_sale_asset_contract: request.buy_asset_contract,
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
				}
				const v1OrderForm = convertOrderToOrderForm(order)
				const orderForm: OrderForm = {
					...v1OrderForm,
					maker_edpk: await getMakerPublicKey(provider),
					take: {
						...v1OrderForm.take,
						value: new BigNumber(updateRequest.price).multipliedBy(order.make.value),
					},
				}
				const orderWithRoyalties = await fill_offchain_royalties(provider, orderForm)
				const updatedOrder = await upsert_order(provider, orderWithRoyalties, true)
				return convertTezosOrderId(updatedOrder.hash)
			},
		})
		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit: updateAction,
		}
	}
}
