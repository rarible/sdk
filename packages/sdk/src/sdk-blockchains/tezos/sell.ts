import type { SellRequest as TezosSellRequest } from "@rarible/tezos-sdk/dist/order/sell"
import { sell } from "@rarible/tezos-sdk/dist/order/sell"
import type { FTAssetType, OrderDataTypeRequest, TezosProvider, XTZAssetType } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import {
	AssetTypeV2, fill_offchain_royalties,
	get_active_order_type,
	get_ft_type,
	get_public_key, OrderType,
	pk_to_pkh,
	upsert_order,
} from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import BigNumber from "bignumber.js"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import type { OrderFormV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import { sellV2 } from "@rarible/tezos-sdk/dist/sales/sell"
import type { OrderId } from "@rarible/api-client"
import { MTAssetType, NFTAssetType } from "tezos-api-client/build/models"
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
	convertOrderPayout, convertOrderToOrderForm,
	convertTezosOrderId, convertTezosToUnionAsset,
	covertToLibAsset, getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies, getTezosAddress, getTezosAssetType, getTezosAssetTypeV2,
	getTezosItemData,
	getTezosOrderId, getTokenIdString,
} from "./common"

export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private unionAPI: IApisSdk,
	) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
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

	async sellV2(request: OrderCommon.OrderInternalRequest): Promise<OrderId> {
		const provider = getRequiredProvider(this.provider)
		const { contract, tokenId } = getTezosItemData(request.itemId)

		const requestCurrency = getCurrencyAssetType(request.currency)

		const expirationDate = request.expirationDate instanceof Date
			? Math.round(request.expirationDate.getTime() / 1000)
			: undefined

		const asset = await getTezosAssetTypeV2(provider.config, requestCurrency)
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
				sale_origin_fees: convertOrderPayout(request.originFees),
				sale_payouts: convertOrderPayout(request.payouts),
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
		const orderId = getTezosOrderId(request.orderId)

		const order = await this.unionAPI.order.getOrderById({ id: orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}
		const { make, take } = order
		const makeAssetType = make.type
		if (makeAssetType["@type"] !== "TEZOS_NFT" && makeAssetType["@type"] !== "TEZOS_MT") {
			throw new Error(`Order is not a sell (id=${orderId})`)
		}
		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const provider = getRequiredProvider(this.provider)
				const request: OrderDataTypeRequest = {
					contract: makeAssetType.contract,
					token_id: new BigNumber(makeAssetType.tokenId),
					seller: order.maker,
					buy_asset_contract: "contract" in take.type ? take.type.contract : undefined,
					buy_asset_token_id: take.type["@type"] === "TEZOS_FT" ? getTokenIdString(take.type.tokenId) : undefined,
				}
				const type = await get_active_order_type(this.provider.config, request)
				if (type === OrderType.V2) {
					const asset = await getTezosAssetTypeV2(provider.config, take.type)
					const tezosRequest: OrderFormV2 = {
						s_asset_contract: makeAssetType.contract,
						s_asset_token_id: new BigNumber(makeAssetType.tokenId),
						s_sale_type: asset.type,
						s_sale_asset_contract: asset.asset_contract,
						s_sale_asset_token_id: asset.asset_token_id,
						s_sale: {
							sale_amount: new BigNumber(updateRequest.price),
							sale_asset_qty: new BigNumber(make.value),
							sale_max_fees_base_boint: 10000,
							sale_end: order.endedAt !== undefined ? new Date(order.endedAt).getTime(): undefined,
							sale_start: undefined,
							sale_origin_fees: order.data["@type"] === "TEZOS_RARIBLE_V2" ? convertOrderPayout(order.data.originFees): [],
							sale_payouts: order.data["@type"] === "TEZOS_RARIBLE_V2" ? convertOrderPayout(order.data.payouts): [],
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
				const orderForm: OrderForm = {
					...convertOrderToOrderForm(order),
				}
				/*
          {
					type: "RARIBLE_V2",
					maker: order.maker,
					maker_edpk: await getMakerPublicKey(provider),
					make: getTezosAssetType(order.make),
					take: {
						...covertToLibAsset(order.take),
						value: new BigNumber(updateRequest.price).multipliedBy(order.make.value),
					},
					salt: order.salt,
					start: order.start,
					end: order.end,
					signature: order.signature,
					data: {
						data_type: "V1",
						payouts: order.data.payouts?.map(p => ({
							account: p.account,
							value: new BigNumber(p.value),
						})) || [],
						origin_fees: order.data.originFees?.map(p => ({
							account: p.account,
							value: new BigNumber(p.value),
						})) || [],
					},
				}

     */
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
