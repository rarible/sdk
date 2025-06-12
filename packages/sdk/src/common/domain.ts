import type * as ApiClient from "@rarible/api-client"
import type { Action } from "@rarible/action"
import type { SupportedBlockchain } from "@rarible/sdk-common"

// @todo draft. probably will be changed in future
export type CurrencyType = {
  blockchain: SupportedBlockchain
  type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20"

export interface AbstractPrepareResponse<Id, In, Out> {
  submit: Action<Id, In, Out>
}

export type RequestCurrency = ApiClient.CurrencyId | RequestCurrencyAssetType

export type RequestCurrencyAssetType =
  | ApiClient.EthErc20AssetType
  | ApiClient.EthEthereumAssetType
  | ApiClient.FlowAssetTypeFt
  | ApiClient.SolanaNftAssetType
  | ApiClient.SolanaFtAssetType
  | ApiClient.SolanaSolAssetType
  | ApiClient.NativeCurrencyAssetType
  | ApiClient.TokenCurrencyAssetType
