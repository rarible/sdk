import type { SellRequest as TezosSellRequest } from "@rarible/tezos-sdk/dist/order/sell"
import { sell } from "@rarible/tezos-sdk/dist/order/sell"
import type { FTAssetType, TezosProvider, XTZAssetType } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { AssetTypeV2, get_ft_type, pk_to_pkh, upsert_order } from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import BigNumber from "bignumber.js"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
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
import type { TezosOrder } from "./domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertOrderPayout,
	convertTezosOrderId,
	covertToLibAsset,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies, getTezosAssetTypeV2,
	getTezosItemData,
	getTezosOrderId,
} from "./common"

export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
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
			run: async (request: OrderCommon.OrderInternalRequest) => {
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
					origin_fees: convertOrderPayout(request.originFees),
				}

				const sellOrder: TezosOrder = await sell(
					provider,
					tezosRequest
				)
				return convertTezosOrderId(sellOrder.hash)
			},
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
				sale_payouts: await getPayouts(provider, request.payouts),
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

		const order = await this.apis.order.getOrderByHash({ hash: orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}
		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const provider = getRequiredProvider(this.provider)

				const orderForm: OrderForm = {
					type: "RARIBLE_V2",
					maker: order.maker,
					maker_edpk: order.makerEdpk,
					taker_edpk: order.takerEdpk,
					make: covertToLibAsset(order.make),
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
				const updatedOrder = await upsert_order(provider, orderForm, true)
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
