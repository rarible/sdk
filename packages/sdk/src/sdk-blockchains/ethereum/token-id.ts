import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import { convertToEVMAddress } from "./common"

export class EthereumTokenId {
	constructor(private readonly sdk: RaribleSdk) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId({ collection, minter }: GenerateTokenIdRequest): Promise<TokenId> {
		const nftTokenId = await this.sdk.apis.nftCollection.generateNftTokenId({
			collection: convertToEVMAddress(collection),
			minter: convertToEVMAddress(minter),
		})
		return {
			tokenId: nftTokenId.tokenId.toString(),
			signature: nftTokenId.signature,
		}
	}
}
