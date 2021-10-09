import type { Collection } from "@rarible/api-client"
import { ItemId } from "@rarible/api-client"
import { Creator } from "@rarible/api-client/build/models/Creator"
import { Royalty } from "@rarible/api-client/build/models/Royalty"
import { Action } from "@rarible/action"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/src/domain"

export type PrepareMintRequest = {
	collection: Collection
}

export type MintRequest = {
	uri: string
	supply: number
	lazyMint: boolean
	creators?: Creator[]
	royalties?: Royalty[]
}

type MintResponseCommon = {
	/**
	 * Identifier of the minted item
	 */
	itemId: ItemId
}

export enum MintType {
	OFF_CHAIN = "off-chain",
	ON_CHAIN = "on-chain"
}

type OnChainMintResponse = MintResponseCommon & {
	type: MintType.ON_CHAIN
	transaction: IBlockchainTransaction
}

type OffChainMintResponse = MintResponseCommon & {
	type: MintType.OFF_CHAIN
}

export type MintResponse = OnChainMintResponse | OffChainMintResponse

export type PrepareMintResponse = {
	multiple: true
	supportsRoyalties: boolean
	supportsLazyMint: boolean
	submit: Action<"mint", MintRequest, MintResponse>
}

type MintFunction = (request: PrepareMintRequest) => Promise<PrepareMintResponse>
