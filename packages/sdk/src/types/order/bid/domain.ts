import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type {
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"
import type { UnionPart } from "../common"

export type PrepareBidResponse = PrepareOrderResponse & {
	getConvertableValue(request: GetConvertableValueRequest): Promise<GetConvertableValueResult>
}

export type GetConvertableValueRequest = {
	assetType: AssetType
	value: BigNumberValue
	walletAddress: UnionAddress
	originFees: UnionPart[]
}
export type GetConvertableValueResult =
  { type: "insufficient" | "convertable", currency: AssetType; value: BigNumberValue } | undefined


export type IBid = (request: PrepareBidRequest) => Promise<PrepareBidResponse>
export type IBidUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>
export type PrepareBidRequest = PrepareOrderRequest | { collectionId: ContractAddress }

export type ConvertCurrencyRequest = {
	price: BigNumberValue
	originFees: UnionPart[]
}
