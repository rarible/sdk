import type { SellRequest as TezosSellRequest } from "@rarible/tezos-sdk/dist/order/sell"
import { sell } from "@rarible/tezos-sdk/dist/order/sell"
// eslint-disable-next-line camelcase
import { pk_to_pkh, upsert_order } from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
import type { TezosProvider, FTAssetType, XTZAssetType } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import { retry } from "../../common/retry"
import type {
	OrderUpdateRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import type { RequestCurrencyAssetType } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { TezosOrder } from "./domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertOrderPayout, covertToLibAsset,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData, getTezosOrderId, convertTezosOrderId,
} from "./common"

export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	parseTakeAssetType(type: RequestCurrencyAssetType): XTZAssetType | FTAssetType {
		switch (type["@type"]) {
			case "XTZ":
				return {
					asset_class: type["@type"],
				}
			case "TEZOS_FT":
				return {
					asset_class: "FT",
					contract: convertFromContractAddress(type.contract),
					token_id: type.tokenId ?  new BigNumber(type.tokenId) : undefined,
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

				const item = await retry(90, 1000, async () => {
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
					take_asset_type: this.parseTakeAssetType(requestCurrency),
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
