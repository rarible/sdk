import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type {
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"

export type PrepareBidResponse = PrepareOrderResponse & {
	getConvertableValue(
		assetType: AssetType, value: BigNumberValue, walletAddress: UnionAddress
	): Promise<GetConvertableValueResult>
}

export type PrepareBidRequest = PrepareOrderRequest | { collectionId: ContractAddress }

export type IBid = (request: PrepareBidRequest) => Promise<PrepareBidResponse>
export type IBidUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>

export type GetConvertableValueResult =
  { type: "insufficient" | "convertable", currency: AssetType; value: BigNumberValue } | undefined
