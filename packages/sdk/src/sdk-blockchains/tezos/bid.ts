import { Action } from "@rarible/action"
import { bid } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import { toBigNumber, toOrderId } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import type { Order as TezosOrder } from "tezos-api-client/build"
import type { FTAssetType, XTZAssetType } from "tezos-sdk-module"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../types/order/common"
import type { RequestCurrency } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { retry } from "../../common/retry"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertContractAddress,
	convertOrderPayout,
	getMakerPublicKey,
	getPayouts, getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData,
} from "./common"

export class TezosBid {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.bid = this.bid.bind(this)
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
					contract: convertContractAddress(type.contract),
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const { itemId, contract } = getTezosItemData(prepare.itemId)

		const item = await retry(30, 1000, async () => {
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

					return toOrderId(`TEZOS:${order.hash}`)
				},
			}),
		}
	}
}
