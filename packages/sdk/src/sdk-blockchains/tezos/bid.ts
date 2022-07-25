import { Action } from "@rarible/action"
import type { TezosNetwork, TezosProvider, FTAssetType, XTZAssetType } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { bid, upsert_order } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { ContractAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "@rarible/tezos-sdk/dist/main"
import type { Order as TezosOrder } from "tezos-api-client/build"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import type {
	OrderRequest,
	OrderUpdateRequest,
} from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { retry } from "../../common/retry"
import type { PrepareOrderUpdateRequest } from "../../types/order/common"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type { PrepareBidUpdateResponse } from "../../types/order/bid/domain"
import type { RequestCurrencyAssetType } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import { notImplemented } from "../../common/not-implemented"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertUnionParts,
	covertToLibAsset,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData,
	getTezosOrderId,
	convertTezosOrderId,
	convertTezosToContractAddress, checkChainId,
} from "./common"
import type { TezosBalance } from "./balance"

export class TezosBid {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private balanceService: TezosBalance,
		private network: TezosNetwork,
	) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
	}

	getMakeAssetType(type: RequestCurrencyAssetType): XTZAssetType | FTAssetType {
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

	private getConvertMap() {
		const convertMap: Record<ContractAddress, string> = {}
		if (this.provider.config.wrapper) {
			convertMap[convertTezosToContractAddress(this.provider.config.wrapper)] = "XTZ"
		}
		return convertMap
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		await checkChainId(this.provider)

		if ("collectionId" in prepare) {
			throw new Error("Bid collection is not supported")
		}
		const { itemId, contract } = getTezosItemData(prepare.itemId)

		const item = await retry(90, 1000, async () => {
			return this.apis.item.getNftItemById({ itemId })
		})
		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const provider = getRequiredProvider(this.provider)
				const makerPublicKey = await getMakerPublicKey(provider)
				const requestCurrency = getCurrencyAssetType(request.currency)

				const order: TezosOrder = await bid(
					provider,
					{
						maker: pk_to_pkh(makerPublicKey),
						maker_edpk: makerPublicKey,
						make_asset_type: this.getMakeAssetType(requestCurrency),
						amount: new BigNumber(request.amount),
						take_asset_type: {
							asset_class: itemCollection.type,
							contract: item.contract,
							token_id: new BigNumber(item.tokenId),
						},
						price: new BigNumber(request.price),
						payouts: await getPayouts(provider, request.payouts),
						origin_fees: convertUnionParts(request.originFees),
					}
				)

				return convertTezosOrderId(order.hash)
			},
		})

		return {
			multiple: itemCollection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			getConvertableValue: notImplemented,
			supportsExpirationDate: false,
			submit,
		}
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		await checkChainId(this.provider)

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
				const updatedOrder = await upsert_order(provider, orderForm, true)
				return convertTezosOrderId(updatedOrder.hash)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			getConvertableValue: notImplemented,
			submit: updateAction,
		}
	}
}
