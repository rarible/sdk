import type { Blockchain, Collection } from "@rarible/api-client"
import { Creator } from "@rarible/api-client/build/models/Creator"
import { Royalty } from "@rarible/api-client/build/models/Royalty"
import { ActionBuilder } from "@rarible/action"
import { CurrencyType } from "../../common/domain"

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

interface IMint {
	prepare(request: PrepareMintRequest): Promise<PrepareMintResponse>
	submit: ActionBuilder<Blockchain, "mint", MintRequest, void> //todo fix Out type
}
