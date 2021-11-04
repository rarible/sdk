import { SellRequest as TezosSellRequest, sell } from "tezos-sdk-module/dist/order/sell"
// eslint-disable-next-line camelcase
import { Provider, get_public_key } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module/dist/main"
import { Action } from "@rarible/action"
import { toBigNumber, toOrderId } from "@rarible/types"
import type { AssetType as TezosLibAssetType, Asset as TezosLibAsset } from "tezos-sdk-module/dist/common/base"
import type { RequestCurrency } from "../../common/domain"
import type { OrderRequest, PrepareOrderRequest, PrepareOrderResponse, UnionPart } from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { Collection, ItemType, TezosOrder } from "./domain"


export class Sell {
	constructor(private provider: Provider) {
		this.sell = this.sell.bind(this)
	}

	parseTakeAssetType(type: RequestCurrency) {
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

	async getPayouts(requestPayouts?: UnionPart[]) {
		let payouts = requestPayouts || []

		if (!Array.isArray(payouts) || payouts.length === 0) {
			return [{
				account: pk_to_pkh(await this.getMakerPublicKey()),
				value: BigInt(10000),
			}]
		}

		return payouts.map(p => ({
			account: pk_to_pkh(p.account),
			value: BigInt(p.value),
		})) || []
	}

	async getMakerPublicKey(): Promise<string> {
		const maker = await get_public_key(this.provider)
		if (!maker) {
			throw new Error("Maker does not exist")
		}
		return maker
	}

	private async getItem(itemId: string): Promise<ItemType> {
		const response = await fetch(`${this.provider.api}/items/${itemId}`)
		const json = await response.json()

		if (json.code === "INVALID_ARGUMENT" || json.code === "UNEXPECTED_API_ERROR") {
			throw new Error("Item does not exist")
		}
		return json
	}

	private async getCollection(collectionId: string): Promise<Collection> {
		const response = await fetch(`${this.provider.api}/collections/${collectionId}`)
		const json = await response.json()

		if (json.code === "INVALID_ARGUMENT" || json.code === "UNEXPECTED_API_ERROR") {
			throw new Error("Collection does not exist")
		}
		return json
	}

	assetTypeToJSON(a: TezosLibAssetType): any {
		switch (a.asset_class) {
			case "FA_2":
				return {
					assetClass: a.asset_class,
					contract: a.contract,
					tokenId: a.token_id.toString(),
				}
			case "XTZ":
				return { assetClass: a.asset_class }
			case "FA_1_2":
				return {
					assetClass: a.asset_class,
					contract: a.contract,
				}
			default: throw new Error("Unsupported asset class")
		}
	}

	mutezToTez(mu: bigint) : number {
		const factor = BigInt(1000000)
		return Number(mu / factor) + Number(mu % factor) / Number(factor)
	}

	assetToJSON(a: TezosLibAsset) : any {
		// @todo handle different decimal for FA_1_2
		switch (a.asset_type.asset_class) {
			case "FA_2":
				return {
					assetType: this.assetTypeToJSON(a.asset_type),
					value: a.value.toString(),
				}
			default:
				const value = this.mutezToTez(a.value)
				return {
					assetType: this.assetTypeToJSON(a.asset_type),
					value: value.toString(),
				}
		}
	}

	async sell(prepareSellRequest: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		if (!prepareSellRequest.itemId) {
			throw new Error("ItemId is not exists")
		}

		const [domain, collection] = prepareSellRequest.itemId.split(":")
		if (domain !== "TEZOS") {
			throw new Error("Not a tezos item")
		}
		const item = await this.getItem(prepareSellRequest.itemId.substring(6))
		const itemCollection = await this.getCollection(collection)
		const makerPublicKey = await this.getMakerPublicKey()

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const tezosRequest : TezosSellRequest = {
					maker: pk_to_pkh(makerPublicKey),
					maker_edpk: makerPublicKey,
					make_asset_type: {
						//todo fix make asset type
						asset_class: itemCollection.type as any,
						contract: item.contract,
						token_id: BigInt(item.tokenId),
					},
					take_asset_type: this.parseTakeAssetType(request.currency),
					amount: BigInt(+request.amount),
					price: BigInt(+request.price),
					payouts: await this.getPayouts(request.payouts),
					origin_fees: request.originFees?.map(p => ({
						account: p.account,
						value: BigInt(p.value),
					})) || [],
				}

				const sellOrder: TezosOrder = await sell(this.provider, tezosRequest)

				return toOrderId(`TEZOS:${sellOrder.hash}`)
			},
		})

		return {
			multiple: false,
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.FULL, //todo check
			payoutsSupport: PayoutsSupport.MULTIPLE, //todo check
			supportedCurrencies: [{
				blockchain: "TEZOS",
				type: "NATIVE",
			}],
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit,
		}
	}
}
