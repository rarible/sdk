import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { RaribleEthereumApis } from "@rarible/protocol-ethereum-sdk/build/common/apis"
import type { GenerateTokenIdRequest, TokenId } from "../../types/nft/generate-token-id"
import { convertToEthereumAddress } from "./common"

export class EthereumTokenId {
	constructor(
		private readonly sdk: RaribleSdk,
		private getEthereumApis: () => Promise<RaribleEthereumApis>,
	) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId({ collection, minter }: GenerateTokenIdRequest): Promise<TokenId> {
		const ethApi = await this.getEthereumApis()
		const nftTokenId = await ethApi.nftCollection.generateNftTokenId({
			collection: convertToEthereumAddress(collection),
			minter: convertToEthereumAddress(minter),
		})
		return {
			tokenId: nftTokenId.tokenId.toString(),
			signature: nftTokenId.signature,
		}
	}
}
