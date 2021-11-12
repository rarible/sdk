import type { Royalty } from "@rarible/api-client/build/models/Royalty"

export type FlowMintRequest = {
	collection: string
	uri: string
	royalties?: Royalty[]
}
