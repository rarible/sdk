import type { Binary, ContractAddress, UnionAddress } from "@rarible/types"

export type GenerateTokenIdRequest = {
	collection: ContractAddress;
	minter: UnionAddress;
}

export type TokenId = {
	tokenId: string;
	signature: {
		v: number;
		r: Binary;
		s: Binary;
	};
}

export type IGenerateTokenId = (prepare: GenerateTokenIdRequest) => Promise<TokenId | undefined>
