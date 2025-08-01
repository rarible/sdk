import type { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { EVMBlockchain } from "@rarible/sdk-common"
import type { CreateCollectionBlockchains } from "./domain"
import type { CreateCollectionResponse } from "./domain"
import type { CreatePublicCollectionArguments } from "./domain"
import type { AptosCreateCollectionTokenAsset } from "./domain"

export type ICreateCollectionSimplified = (req: CreateCollectionRequestSimplified) => Promise<CreateCollectionResponse>

export type CreateCollectionRequestSimplified =
  | EthereumCreatePublicCollectionSimplified
  | EthereumCreatePrivateCollectionSimplified
  | SolanaCreateCollectionSimplified
  | AptosCreateCollectionSimplified

export interface AbstractCreateCollectionSimplified<T extends CreateCollectionBlockchains> {
  blockchain: T
}

/**
 * Ethereum create collection argument types
 */
export interface EthereumCreatePublicCollectionSimplified
  extends AbstractCreateCollectionSimplified<EVMBlockchain>,
    EthereumCreateCollectionSimplifiedCommon {
  isPublic: true
}

export interface EthereumCreatePrivateCollectionSimplified
  extends AbstractCreateCollectionSimplified<EVMBlockchain>,
    EthereumCreateCollectionSimplifiedCommon {
  isPublic: false
  operators: UnionAddress[]
}

export type EthereumCreateCollectionSimplifiedCommon = {
  type: "ERC721" | "ERC1155"
} & Omit<CreatePublicCollectionArguments, "isUserToken">

/**
 * Solana
 */
export interface SolanaCreateCollectionSimplified extends AbstractCreateCollectionSimplified<Blockchain.SOLANA> {
  metadataURI: string
}

/**
 * Aptos
 */
export type AptosCreateCollectionSimplified = AbstractCreateCollectionSimplified<Blockchain.APTOS> &
  AptosCreateCollectionTokenAsset
