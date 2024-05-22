import type { Binary, ContractAddress, UnionAddress } from "@rarible/types"

export type GenerateTokenIdRequest = {
  collection: ContractAddress
  minter: UnionAddress
}

export type TokenId = {
  tokenId: string
  signature: {
    v: number
    r: Binary
    s: Binary
  }
}

/**
 * Generates a token id (for future minting)
 * -
 * @param prepare
 * @returns {Promise<TokenId | undefined>}
 * @example
 * const {tokenId, signature} = sdk.nft.generateTokenId({
 * 		collection: toContractAddress("ETHEREUM:0x..."),
 * 		minter: toUnionAddress("ETHEREUM:0x...")},
 * 	)
 *
 */
export type IGenerateTokenId = (prepare: GenerateTokenIdRequest) => Promise<TokenId | undefined>
