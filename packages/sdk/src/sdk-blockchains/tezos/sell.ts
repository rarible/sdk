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
import { getMakerPublicKey, getPayouts, getSupportedCurrencies } from "./common"


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

	// parseTakeAssetType(type: RequestCurrency): XTZAssetType | FTAssetType {
	//todo fix return type
	parseTakeAssetType(type: RequestCurrency): any {
		switch (type["@type"]) {
			case "XTZ":
				return {
					asset_class: type["@type"],
				}
			case "FA_1_2":
				return {
					asset_class: type["@type"],
					contract: type.contract,
				}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	private async getItem(itemId: string): Promise<ItemType> {
		const provider = this.getRequiredProvider()
		const response = await fetch(`${provider.api}/items/${itemId}`)
		const json = await response.json()

		if (json.code === "INVALID_ARGUMENT" || json.code === "UNEXPECTED_API_ERROR") {
			throw new Error("Item does not exist")
		}
		return json
	}

	private async getCollection(collectionId: string): Promise<Collection> {
		const provider = this.getRequiredProvider()
		const response = await fetch(`${provider.api}/collections/${collectionId}`)
		const json = await response.json()

		if (json.code === "INVALID_ARGUMENT" || json.code === "UNEXPECTED_API_ERROR") {
			throw new Error("Collection does not exist")
		}
		return json
	}

	assetTypeToJSON(a: TezosLibAssetType): any {
		switch (a.asset_class) {
			case "MT":
			case "NFT":
				return {
					assetClass: a.asset_class,
					contract: a.contract,
					tokenId: a.token_id.toString(),
				}
			case "XTZ":
				return { assetClass: a.asset_class }
			case "FT":
				return {
					assetClass: a.asset_class,
					contract: a.contract,
				}
			default: {
				throw new Error("Unsupported asset class")
			}
		}
	}

	assetToJSON(a: TezosLibAsset) : any {
		// @todo handle different decimal for FA_1_2
		switch (a.asset_type.asset_class) {
			case "MT":
			case "NFT":
				return {
					assetType: this.assetTypeToJSON(a.asset_type),
					value: a.value.toString(),
				}
			default:
				const value = mutez_to_tez(a.value)
				return {
					assetType: this.assetTypeToJSON(a.asset_type),
					value: value.toString(),
				}
		}
	}

	async sell(prepareSellRequest: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const provider = this.getRequiredProvider()
		if (!prepareSellRequest.itemId) {
			throw new Error("ItemId is not exists")
		}

		const [domain, collection] = prepareSellRequest.itemId.split(":")
		if (domain !== "TEZOS") {
			throw new Error("Not a tezos item")
		}
		const item = await this.getItem(prepareSellRequest.itemId.substring(6))
		const itemCollection = await this.getCollection(collection)
		const makerPublicKey = await getMakerPublicKey(provider)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const tezosRequest : TezosSellRequest = {
					maker: pk_to_pkh(makerPublicKey),
					maker_edpk: makerPublicKey,
					make_asset_type: {
						// @todo fix make asset type
						asset_class: itemCollection.type as any,
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
