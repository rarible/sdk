import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { bid, upsert_order } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import { toBigNumber } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import type { Order as TezosOrder } from "tezos-api-client/build"
import type { FTAssetType, XTZAssetType } from "tezos-sdk-module"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { OrderForm } from "tezos-sdk-module/dist/order"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type {
	OrderRequest,
	OrderUpdateRequest,
	PrepareOrderRequest,
} from "../../types/order/common"
import type { RequestCurrency } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { retry } from "../../common/retry"
import type { PrepareOrderUpdateRequest, PrepareOrderUpdateResponse } from "../../types/order/common"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { GetConvertableValueResult } from "../../types/order/bid/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertOrderPayout, covertToLibAsset,
	getMakerPublicKey,
	getPayouts, getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData, getTezosOrderId, convertTezosOrderId,
} from "./common"

export class TezosBid {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
	}

	getMakeAssetType(type: RequestCurrency): XTZAssetType | FTAssetType {
		switch (type["@type"]) {
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			case "TEZOS_FT": {
				return {
					asset_class: "FT",
					contract: convertFromContractAddress(type.contract),
					token_id: type.tokenId !== undefined ?  new BigNumber(type.tokenId) : undefined,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	private async getConvertableValue(): Promise<GetConvertableValueResult> {
		return undefined
	}

	private async convert(): Promise<IBlockchainTransaction> {
		throw new Error("Convert operation is not supported")
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareBidResponse> {
		const { itemId, contract } = getTezosItemData(prepare.itemId)

		const item = await retry(90, 1000, async () => {
			return this.apis.item.getNftItemById({ itemId })
		})
		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		return {
			multiple: itemCollection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			getConvertableValue: this.getConvertableValue,
			convert: this.convert,
			submit: Action.create({
				id: "send-tx" as const,
				run: async (request: OrderRequest) => {
					const provider = getRequiredProvider(this.provider)
					const makerPublicKey = await getMakerPublicKey(provider)

					const order: TezosOrder = await bid(
						provider,
						{
							maker: pk_to_pkh(makerPublicKey),
							maker_edpk: makerPublicKey,
							make_asset_type: this.getMakeAssetType(request.currency),
							amount: new BigNumber(request.amount),
							take_asset_type: {
								asset_class: itemCollection.type,
								contract: item.contract,
								token_id: new BigNumber(item.tokenId),
							},
							price: new BigNumber(request.price),
							payouts: await getPayouts(provider, request.payouts),
							origin_fees: convertOrderPayout(request.originFees),
						}
					)

					return convertTezosOrderId(order.hash)
				},
			}),
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
					make: {
						...covertToLibAsset(order.make),
						value: new BigNumber(updateRequest.price).multipliedBy(order.take.value),
					},
					take: covertToLibAsset(order.take),
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
				const updatedOrder = await upsert_order(provider, orderForm, false)
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
