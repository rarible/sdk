import type * as ApiClient from "@rarible/api-client"
import type { Action } from "@rarible/action"
import type { FlowContractAddress } from "@rarible/flow-sdk"

// @todo draft. probably will be changed in future
export type CurrencyType = {
	blockchain: ApiClient.Blockchain
	type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20" | "TEZOS_FT"

export interface AbstractPrepareResponse<Id, In, Out> {
	submit: Action<Id, In, Out>
}

export type RequestCurrency = ApiClient.CurrencyId | RequestCurrencyAssetType

export type RequestCurrencyAssetType =
	| ApiClient.EthErc20AssetType
	| ApiClient.EthEthereumAssetType
	| ApiClient.FlowAssetTypeNft
	| ApiClient.FlowAssetTypeFt
	| ApiClient.TezosXTZAssetType
	| ApiClient.TezosFTAssetType
	| ApiClient.SolanaNftAssetType
	| ApiClient.SolanaSolAssetType

export type AbstractItemId<T extends ApiClient.Blockchain, ContractAddress extends string> = {
	blockchain: T
	contract: ContractAddress
	itemId: string
}

//todo completelgy get rid of this, do not parse ids
export type FlowItemId = AbstractItemId<ApiClient.Blockchain.FLOW, FlowContractAddress>
