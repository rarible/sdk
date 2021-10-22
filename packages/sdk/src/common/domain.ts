import {
	Blockchain,
	EthErc20AssetType,
	EthEthereumAssetType,
	FlowAssetTypeFt,
	FlowAssetTypeNft,
} from "@rarible/api-client"
import { Action } from "@rarible/action"
import { TezosFA12AssetType, TezosXTZAssetType } from "@rarible/api-client/build/models/AssetType"

//todo draft. probably will be changed in future
export type CurrencyType = {
	blockchain: Blockchain
	type: CurrencySubType
}

export type CurrencySubType = "NATIVE" | "ERC20"

export interface AbstractPrepareResponse<Id, In, Out> {
	submit: Action<Id, In, Out>
}

export type RequestCurrency =
  EthErc20AssetType | EthEthereumAssetType |
  FlowAssetTypeNft | FlowAssetTypeFt |
  TezosXTZAssetType | TezosFA12AssetType
