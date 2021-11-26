import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { get_next_token_id } from "tezos-sdk-module"
import { toBinary } from "@rarible/types"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import { getTezosAddress, isExistedTezosProvider } from "./common"
import type { ITezosAPI, MaybeProvider } from "./common"

export class TezosTokenId {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async generateTokenId({ collection }: GenerateTokenIdRequest): Promise<TokenId> {
		const tokenId = await get_next_token_id(
			this.getRequiredProvider(),
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
