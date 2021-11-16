import type * as ApiClient from "@rarible/api-client"
import type { Action } from "@rarible/action"
import type * as TezosAPI from "@rarible/api-client/build/models/AssetType"
import type { FlowContractAddress } from "@rarible/flow-sdk/build/common/flow-address"
import type { Address } from "@rarible/types"

// @todo draft. probably will be changed in future
export type CurrencyType = {
	blockchain: ApiClient.Blockchain
	type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20"

export interface AbstractPrepareResponse<Id, In, Out> {
	submit: Action<Id, In, Out>
}

export type RequestCurrency =
  | ApiClient.EthErc20AssetType
  | ApiClient.EthEthereumAssetType
  | ApiClient.FlowAssetTypeNft
  | ApiClient.FlowAssetTypeFt
  | TezosAPI.TezosXTZAssetType
  | TezosAPI.TezosFA12AssetType

export type AbstractItemId<T extends ApiClient.Blockchain, ContractAddress extends string> = {
	blockchain: T
	contract: ContractAddress
	itemId: string
}

export type FlowItemId = AbstractItemId<"FLOW", FlowContractAddress>
export type EthereumItemId = AbstractItemId<"ETHEREUM", Address>
export type TezosItemId = AbstractItemId<"TEZOS", string>
export type PolygonItemId = AbstractItemId<"POLYGON", string>
