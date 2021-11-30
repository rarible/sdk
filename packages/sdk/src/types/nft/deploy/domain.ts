import type * as ApiClient from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { Action } from "@rarible/action"

export type DeployTokenRequest =
  | DeployTezosTokenRequest
  | DeployEthereumTokenRequest

export type DeployTezosTokenRequest = {
	blockchain: ApiClient.Blockchain.TEZOS
	asset: TezosDeployTokenAsset
}

export type DeployEthereumTokenRequest = {
	blockchain: ApiClient.Blockchain.ETHEREUM
	asset: EthereumDeployTokenAsset
}

export type TezosDeployTokenAsset = {
	assetType: "NFT" | "MT"
	arguments: {
		owner: UnionAddress,
		isPublicCollection: boolean,
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
