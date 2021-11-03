import { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { bid } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import { toBigNumber, toOrderId } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import { Order as TezosOrder } from "tezos-api-client/build"
import { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../order/common"
import { RequestCurrency } from "../../common/domain"
import { getMakerPublicKey, getPayouts, getSupportedCurrencies, getTezosItemData, ITezosAPI } from "./common"

export class Bid {
	constructor(
		private provider: Provider,
		private apis: ITezosAPI,
	) {
		this.bid = this.bid.bind(this)
	}

	getMakeAssetType(type: RequestCurrency) {
		switch (type["@type"]) {
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			case "FA_1_2": {
				return {
					asset_class: type["@type"],
					contract: type.contract,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const { itemId } = getTezosItemData(prepare.itemId)

		const item = await this.apis.item.getNftItemById({ itemId })

		console.log("item", item)
		throw new Error("ok")
		return {
			multiple: false,
			maxAmount: toBigNumber(item.supply),
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit: Action.create({
				id: "send-tx" as const,
				run: async (request: OrderRequest) => {
					const makerPublicKey = await getMakerPublicKey(this.provider)

					const order: TezosOrder = await bid(
						this.provider,
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
							payouts: await getPayouts(this.provider, request.payouts),
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
