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

export type AbstractItemId<T extends Blockchain> = {
	blockchain: T
	collectionId: string
	itemId: string
}

export type FlowItemId = AbstractItemId<"FLOW">
export type EthereumItemId = AbstractItemId<"ETHEREUM">
export type TezosItemId = AbstractItemId<"TEZOS">
export type PolygonItemId = AbstractItemId<"POLYGON">
