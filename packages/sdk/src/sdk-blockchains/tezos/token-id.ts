import type { TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { get_next_token_id } from "@rarible/tezos-sdk"
import { toBinary } from "@rarible/types"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import { getRequiredProvider, getTezosAddress } from "./common"
import type { ITezosAPI, MaybeProvider } from "./common"

export class TezosTokenId {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId({ collection }: GenerateTokenIdRequest): Promise<TokenId> {
		const tokenId = await get_next_token_id(
			getRequiredProvider(this.provider),
			getTezosAddress(collection)
		)
		return {
			tokenId: tokenId.toString(),
			signature: {
				v: 0,
				r: toBinary("0"),
				s: toBinary("0"),
			},
		}
	}
}
