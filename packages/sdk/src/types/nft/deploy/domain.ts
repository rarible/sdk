import type * as ApiClient from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { UnionAddress } from "@rarible/types"
import type { Action } from "@rarible/action"
import type { SupportedBlockchain } from "@rarible/sdk-common"
import type { UnionContractAddress } from "@rarible/api-client"

export type CreateCollectionRequest<T extends CreateCollectionBlockchains = CreateCollectionBlockchains> = {
  blockchain: T
  asset: CreateCollectionAsset[T]
}

export interface CreateCollectionAsset extends Record<CreateCollectionBlockchains, DeployTokenAsset> {
  [ApiClient.Blockchain.ETHEREUM]: EthereumCreateCollectionAsset
  [ApiClient.Blockchain.SOLANA]: SolanaCreateCollectionTokenAsset
  [ApiClient.Blockchain.APTOS]: AptosCreateCollectionTokenAsset
}

export type CreateCollectionBlockchains = SupportedBlockchain

export type DeployTokenAsset =
  | EthereumCreateCollectionAsset
  | SolanaCreateCollectionTokenAsset
  | AptosCreateCollectionTokenAsset

export type SolanaCreateCollectionTokenAsset = {
  arguments: {
    metadataURI: string
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

export type CreatePrivateCollectionArguments = Omit<CreatePublicCollectionArguments, "isUserToken"> & {
  isUserToken: true
  operators: UnionAddress[]
}

export type CreateCollectionResponse = {
  tx: IBlockchainTransaction
  address: UnionContractAddress
}

export type AptosCreateCollectionTokenAsset = {
  name: string
  description: string
  uri: string
}

/**
 * Create collection - Deploy contract with custom properties
 * -
 * @example
 * const { tx, address } = sdk.nft.createCollection({
 *	blockchain: Blockchain.ETHEREUM,
 *		type: "ERC721",
 *		name: "name",
 *		symbol: "RARI",
 *		baseURI: "https://ipfs.rarible.com",
 *		contractURI: "https://ipfs.rarible.com",
 *		isPublic: true,
 * })
 */
export type ICreateCollectionAction = Action<"send-tx", CreateCollectionRequest, CreateCollectionResponse>
