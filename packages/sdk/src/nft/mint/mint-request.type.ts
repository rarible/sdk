import { Creator } from "@rarible/api-client/build/models/Creator"
import { Royalty } from "@rarible/api-client/build/models/Royalty"

export type MintRequest = {
	uri: string
	supply: number
	lazyMint: boolean
	creators?: Creator[]
	royalties?: Royalty[]
}
