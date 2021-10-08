import type { Blockchain, Collection } from "@rarible/api-client"
import { Creator } from "@rarible/api-client/build/models/Creator"
import { Royalty } from "@rarible/api-client/build/models/Royalty"
import { ActionBuilder } from "@rarible/action"
import { CurrencyType } from "../../common/domain"
import { ItemId } from "@rarible/api-client"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/src/domain"

export type PrepareMintRequest = {
	collection: Collection
}

export type PrepareMintResponse = {
	multiple: true
	supportsRoyalties: boolean
	supportsLazyMint: boolean
	supportedCurrencies: CurrencyType[]
}

export type MintRequest = {
	collection: Collection
	uri: string
	supply: number
	lazyMint: boolean
	creators?: Creator[]
	royalties?: Royalty[]
}

export enum MintType {
	OFF_CHAIN = "off-chain",
	ON_CHAIN = "on-chain"
}

type MintResponseCommon = {
	/**
	 * Identifier of the minted item
	 */
	itemId: ItemId
}
type OnChainMintResponse = MintResponseCommon & {
	type: MintType.ON_CHAIN
	transaction: IBlockchainTransaction
}
type OffChainMintResponse = MintResponseCommon & {
	type: MintType.OFF_CHAIN
}

export type MintResponse = OnChainMintResponse | OffChainMintResponse

interface IMint {
	prepare(request: PrepareMintRequest): Promise<PrepareMintResponse>
	submit: ActionBuilder<Blockchain, "mint", MintRequest, MintResponse>
}
