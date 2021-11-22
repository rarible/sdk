import type { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { bid } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import { toBigNumber, toOrderId } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import type { Order as TezosOrder } from "tezos-api-client/build"
import type { Maybe } from "@rarible/types/build/maybe"
import type { FTAssetType, XTZAssetType } from "tezos-sdk-module/common/base"
import type { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../types/order/common"
import type { RequestCurrency } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { ITezosAPI } from "./common"
import { getMakerPublicKey, getPayouts, getSupportedCurrencies, getTezosItemData } from "./common"

export class TezosBid {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {
		this.bid = this.bid.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
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
					contract: type.contract,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const provider = this.getRequiredProvider()
		const { itemId } = getTezosItemData(prepare.itemId)

		const item = await this.apis.item.getNftItemById({ itemId })

		console.log("item", item)
		return {
			multiple: true,
			maxAmount: toBigNumber(item.supply),
			//todo FIX
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.SINGLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(provider.config.fees.toString()),
			submit: Action.create({
				id: "send-tx" as const,
				run: async (request: OrderRequest) => {
					const makerPublicKey = await getMakerPublicKey(provider)

					const order: TezosOrder = await bid(
						provider,
						{
							maker: pk_to_pkh(makerPublicKey),
							maker_edpk: makerPublicKey,
							make_asset_type: this.getMakeAssetType(request.currency),
							amount: new BigNumber(request.amount.toFixed()),
							take_asset_type: {
								contract: item.contract,
								token_id: new BigNumber(item.tokenId),
							},
							price: new BigNumber(request.price),
							payouts: await getPayouts(provider, request.payouts),
							origin_fees: request.originFees?.map(p => ({
								account: p.account,
								value: new BigNumber(p.value),
							})) || [],
						}
					)

					return toOrderId(`TEZOS:${order.hash}`)
				},
			}),
		}
	}
}
