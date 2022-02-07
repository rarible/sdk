import type * as ApiClient from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { Action } from "@rarible/action"

export type DeployTokenRequest<T extends DeploySupportedBlockchains = DeploySupportedBlockchains> = {
	blockchain: T;
	asset: DeployTokenAssetIndexer[T]
}

export interface DeployTokenAssetIndexer extends Record<DeploySupportedBlockchains, DeployTokenAsset> {
	[ApiClient.Blockchain.ETHEREUM]: EthereumDeployTokenAsset;
	[ApiClient.Blockchain.TEZOS]: TezosDeployTokenAsset;
}

export type DeploySupportedBlockchains =
	ApiClient.Blockchain.ETHEREUM |
	ApiClient.Blockchain.POLYGON |
	ApiClient.Blockchain.TEZOS

export type DeployTokenAsset = EthereumDeployTokenAsset | TezosDeployTokenAsset

export type TezosDeployTokenAsset = {
	assetType: "NFT" | "MT"
	arguments: {
		name: string
		symbol: string
		contractURI: string
		isUserToken: boolean,
	}
}

export type EthereumDeployTokenAsset = {
	assetType: "ERC721" | "ERC1155"
	arguments: DeployUserTokenArguments | DeployNonUserTokenArguments
}

export type DeployNonUserTokenArguments = {
	name: string
	symbol: string
	baseURI: string
	contractURI: string
	isUserToken: false
}

export type DeployUserTokenArguments =
  Omit<DeployNonUserTokenArguments, "isUserToken"> & {
  	isUserToken: true
  	operators: UnionAddress[]
  }

export type DeployResponse = {
	tx: IBlockchainTransaction,
	address: ContractAddress
}

export type IDeploy = Action<"send-tx", DeployTokenRequest, DeployResponse>
