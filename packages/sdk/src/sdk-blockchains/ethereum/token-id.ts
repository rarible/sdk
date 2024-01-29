import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toBinary } from "@rarible/types"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import type { IApisSdk } from "../../domain"

export class EthereumTokenId {
	constructor(
		private readonly sdk: RaribleSdk,
		private apis: IApisSdk,
	) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId({ collection, minter }: GenerateTokenIdRequest): Promise<TokenId> {
		const nftTokenId = await this.apis.collection.generateTokenId({
			collection: collection,
			minter: minter,
		})
		return {
			tokenId: nftTokenId.tokenId.toString(),
			signature: nftTokenId["@type"] === "ETHEREUM" ? {
				v: nftTokenId.signature.v, r: toBinary(nftTokenId.signature.r), s: toBinary(nftTokenId.signature.s),
			} : {
				v: 0, r: toBinary("0x"), s: toBinary("0x"),
			},
		}
	}
}
