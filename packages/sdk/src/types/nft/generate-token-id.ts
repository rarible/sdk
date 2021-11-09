import type { UnionAddress } from "@rarible/types"

export type IGenerateTokenId = (collection: UnionAddress, minter: UnionAddress) => Promise<string | undefined>