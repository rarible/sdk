import type * as ApiClient from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { Action } from "@rarible/action"

export type CreateCollectionRequest<T extends CreateCollectionBlockchains = CreateCollectionBlockchains> = {
	blockchain: T;
	asset: CreateCollectionAsset[T]
}

export interface CreateCollectionAsset extends Record<CreateCollectionBlockchains, DeployTokenAsset> {
	[ApiClient.Blockchain.ETHEREUM]: EthereumCreateCollectionAsset;
	[ApiClient.Blockchain.TEZOS]: TezosCreateCollectionTokenAsset;
	[ApiClient.Blockchain.SOLANA]: SolanaCreateCollectionTokenAsset;
}

export type CreateCollectionBlockchains =
	ApiClient.Blockchain.ETHEREUM |
	ApiClient.Blockchain.POLYGON |
	ApiClient.Blockchain.TEZOS |
	ApiClient.Blockchain.SOLANA

export type DeployTokenAsset =
	EthereumCreateCollectionAsset |
	TezosCreateCollectionTokenAsset |
	SolanaCreateCollectionTokenAsset

export type SolanaCreateCollectionTokenAsset = {
	arguments: {
		metadataURI: string
	}
}

export type TezosCreateCollectionTokenAsset = {
	assetType: "NFT" | "MT"
	arguments: {
		name: string
		symbol: string
		contractURI: string
		isUserToken: boolean,
	}
}

export type EthereumCreateCollectionAsset = {
	assetType: "ERC721" | "ERC1155"
	arguments: CreatePrivateCollectionArguments | CreatePublicCollectionArguments
}

export type CreatePublicCollectionArguments = {
	name: string
	symbol: string
	baseURI: string
	contractURI: string
	isUserToken: false
}

export type CreatePrivateCollectionArguments =
  Omit<CreatePublicCollectionArguments, "isUserToken"> & {
  	isUserToken: true
  	operators: UnionAddress[]
  }

export type CreateCollectionResponse = {
	tx: IBlockchainTransaction,
	address: ContractAddress
}

export type ICreateCollection = Action<"send-tx", CreateCollectionRequest, CreateCollectionResponse>
