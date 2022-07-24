import type { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { CreateCollectionBlockchains } from "./domain"
import type { CreateCollectionResponse } from "./domain"

export type ICreateCollectionSimplified = (req: CreateCollectionRequestSimplified) => Promise<CreateCollectionResponse>

export type CreateCollectionRequestSimplified =
  | EthereumCreatePublicCollectionSimplified
  | EthereumCreatePrivateCollectionSimplified
  | TezosCreatePublicCollectionSimplified
  | SolanaCreateCollectionSimplified


export interface AbstractCreateCollectionSimplified<T extends CreateCollectionBlockchains>
{
	blockchain: T
}

/**
 * Ethereum create collection argument types
 */
export interface EthereumCreatePublicCollectionSimplified extends
	AbstractCreateCollectionSimplified<Blockchain.ETHEREUM | Blockchain.POLYGON>,
	EthereumCreateCollectionSimplifiedCommon {
	isPublic: true
}

export interface EthereumCreatePrivateCollectionSimplified extends
	AbstractCreateCollectionSimplified<Blockchain.ETHEREUM | Blockchain.POLYGON>,
	EthereumCreateCollectionSimplifiedCommon {
	isPublic: false
	operators: UnionAddress[]
}

export interface EthereumCreateCollectionSimplifiedCommon {
	type: "ERC721" | "ERC1155"
	name: string
	symbol: string
	baseURI: string
	contractURI: string
}

/**
 * Tezos
 */
export interface TezosCreatePublicCollectionSimplified extends
	AbstractCreateCollectionSimplified<Blockchain.TEZOS> {
	type: "NFT" | "MT"
	symbol: string
	name: string
	contractURI: string
	isPublic: boolean
}

/**
 * Solana
 */
export interface SolanaCreateCollectionSimplified extends AbstractCreateCollectionSimplified<Blockchain.SOLANA> {
	metadataURI: string
}
