import type { TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { get_next_token_id } from "@rarible/tezos-sdk"
import { toBinary } from "@rarible/types"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import { convertFromContractAddress, getRequiredProvider } from "./common"
import type { MaybeProvider } from "./common"

export class TezosTokenId {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
	) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId({ collection }: GenerateTokenIdRequest): Promise<TokenId> {
		const tokenId = await get_next_token_id(
			getRequiredProvider(this.provider),
			convertFromContractAddress(collection)
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
