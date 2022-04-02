import type { AssetType, CollectionId, CurrencyId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type {
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
	UnionPart,
} from "../common"

export type PrepareBidResponse = PrepareOrderResponse & GetConvertableValueFunction

export type PrepareBidUpdateResponse = PrepareOrderUpdateResponse & GetConvertableValueFunction

export type GetConvertableValueFunction = {
	getConvertableValue(request: GetConvertableValueRequest): Promise<GetConvertableValueResult>
}

export type GetConvertableValueRequest = {
	assetType?: AssetType
	currencyId?: CurrencyId
	price: BigNumberValue
	amount: number
	originFees: UnionPart[]
}

export type GetConvertableValueResult = {
	type: "insufficient" | "convertable"
	currency: AssetType
	value: BigNumberValue
} | undefined

export type IBid = (request: PrepareBidRequest) => Promise<PrepareBidResponse>
export type IBidUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareBidUpdateResponse>
export type PrepareBidRequest = PrepareOrderRequest | { collectionId: CollectionId }

export type ConvertCurrencyRequest = {
	price: BigNumberValue
}
