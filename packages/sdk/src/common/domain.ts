import type * as ApiClient from "@rarible/api-client"
import type { Action } from "@rarible/action"

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
	| ApiClient.FlowAssetTypeFt
	| ApiClient.TezosXTZAssetType
	| ApiClient.TezosFTAssetType
	| ApiClient.SolanaNftAssetType
	| ApiClient.SolanaSolAssetType
