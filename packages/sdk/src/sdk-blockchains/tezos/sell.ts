import type { SellRequest as TezosSellRequest } from "tezos-sdk-module/dist/order/sell"
import { sell } from "tezos-sdk-module/dist/order/sell"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module"
import { Action } from "@rarible/action"
import { toOrderId } from "@rarible/types"
import type { TezosProvider, FTAssetType, XTZAssetType } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import type { RequestCurrency } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import { retry } from "../../common/retry"
import type { TezosOrder } from "./domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertContractAddress,
	convertOrderPayout,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData,
} from "./common"


export class TezosSell {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.sell = this.sell.bind(this)
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
					contract: convertContractAddress(type.contract),
				}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async sell(
		prepareRequest: OrderCommon.PrepareOrderInternalRequest
	): Promise<OrderCommon.PrepareOrderInternalResponse> {
		const [domain, contract] = prepareRequest.collectionId.split(":")
		if (domain !== "TEZOS") {
			throw new Error("Not an tezos item")
		}
		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				const provider = getRequiredProvider(this.provider)
				const makerPublicKey = await getMakerPublicKey(provider)
				const { itemId } = getTezosItemData(request.itemId)

				const item = await retry(30, 1000, async () => {
				   return this.apis.item.getNftItemById({ itemId })
				})

				const tezosRequest: TezosSellRequest = {
					maker: pk_to_pkh(makerPublicKey),
					maker_edpk: makerPublicKey,
					make_asset_type: {
						asset_class: itemCollection.type,
						contract: item.contract,
						token_id: new BigNumber(item.tokenId),
					},
					take_asset_type: this.parseTakeAssetType(request.currency),
					amount: new BigNumber(request.amount),
					price: new BigNumber(request.price),
					payouts: await getPayouts(provider, request.payouts),
					origin_fees: convertOrderPayout(request.originFees),
				}

				const sellOrder: TezosOrder = await sell(
					provider,
					tezosRequest
				)
				return toOrderId(`TEZOS:${sellOrder.hash}`)
			},
		})

		return {
			multiple: itemCollection.type === "MT",
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit,
		}
	}

}
