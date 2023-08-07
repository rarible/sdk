import type { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { CreateCollectionBlockchains } from "./domain"
import type { CreateCollectionResponse } from "./domain"
import type { CreatePublicCollectionArguments } from "./domain"
import type { TezosCreateCollectionTokenAsset } from "./domain"

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
	AbstractCreateCollectionSimplified<Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE>,
	EthereumCreateCollectionSimplifiedCommon {
	isPublic: true
}

export interface EthereumCreatePrivateCollectionSimplified extends
	AbstractCreateCollectionSimplified<Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE>,
	EthereumCreateCollectionSimplifiedCommon {
	isPublic: false
	operators: UnionAddress[]
}

export type EthereumCreateCollectionSimplifiedCommon = {
	type: "ERC721" | "ERC1155"
} & Omit<CreatePublicCollectionArguments, "isUserToken">

/**
 * Tezos
 */
export type TezosCreatePublicCollectionSimplified =
	AbstractCreateCollectionSimplified<Blockchain.TEZOS>
	& Omit<TezosCreateCollectionTokenAsset["arguments"], "isUserToken">
	& {
		type: "NFT" | "MT"
		isPublic: boolean
	}

/**
 * Solana
 */
export interface SolanaCreateCollectionSimplified extends AbstractCreateCollectionSimplified<Blockchain.SOLANA> {
	metadataURI: string
}
