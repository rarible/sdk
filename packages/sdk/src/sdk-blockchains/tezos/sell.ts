import type { SellRequest as TezosSellRequest } from "tezos-sdk-module/dist/order/sell"
import { sell } from "tezos-sdk-module/dist/order/sell"
// eslint-disable-next-line camelcase
import { mutez_to_tez } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import { Action } from "@rarible/action"
import type { Maybe } from "@rarible/types/build/maybe"
import { toBigNumber, toOrderId } from "@rarible/types"
import type { AssetType as TezosLibAssetType, Asset as TezosLibAsset, Provider } from "tezos-sdk-module/dist/common/base"
import BigNumber from "bignumber.js"
import type { FTAssetType, XTZAssetType } from "tezos-sdk-module/common/base"
import type { RequestCurrency } from "../../common/domain"
import type { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { Collection, ItemType, TezosOrder } from "./domain"
import type { ITezosAPI } from "./common"
import { getMakerPublicKey, getPayouts, getSupportedCurrencies, getTezosItemData } from "./common"


export class TezosSell {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {
		this.sell = this.sell.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	parseTakeAssetType(type: RequestCurrency): XTZAssetType | FTAssetType {
		switch (type["@type"]) {
			case "XTZ":
				return {
					asset_class: type["@type"],
				}
			case "TEZOS_FT":
				return {
					asset_class: "FT",
					contract: type.contract,
				}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async sell(prepareSellRequest: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const provider = this.getRequiredProvider()
		if (!prepareSellRequest.itemId) {
			throw new Error("ItemId is not exists")
		}
		const { itemId, contract } = getTezosItemData(prepareSellRequest.itemId)
		const item = await this.apis.item.getNftItemById({
			itemId,
		})
		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})
		const makerPublicKey = await getMakerPublicKey(provider)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const tezosRequest: TezosSellRequest = {
					maker: pk_to_pkh(makerPublicKey),
					maker_edpk: makerPublicKey,
					make_asset_type: {
						// @todo fix make asset type
						asset_class: itemCollection.type,
						contract: item.contract,
						token_id: new BigNumber(item.tokenId),
					},
					take_asset_type: this.parseTakeAssetType(request.currency),
					amount: new BigNumber(request.amount),
					price: new BigNumber(request.price),
					payouts: await getPayouts(provider, request.payouts),
					origin_fees: request.originFees?.map(p => ({
						account: p.account,
						value: new BigNumber(p.value),
					})) || [],
				}

				const sellOrder: TezosOrder = await sell(provider, tezosRequest)
				return toOrderId(`TEZOS:${sellOrder.hash}`)
			},
		})

		return {
			multiple: true,
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.FULL, //todo check
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(provider.config.fees.toString()),
			submit,
		}
	}
}
