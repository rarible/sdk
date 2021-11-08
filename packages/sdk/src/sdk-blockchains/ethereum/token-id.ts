import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import { convertUnionToEthereumAddress } from "./common"

export class EthereumTokenId {
	constructor(private readonly sdk: RaribleSdk) {
		this.generateTokenId = this.generateTokenId.bind(this)
	}

	async generateTokenId(
		collection: UnionAddress,
		minter: UnionAddress
	): Promise<string> {
		const nftTokenId = await this.sdk.apis.nftCollection.generateNftTokenId({
			collection: convertUnionToEthereumAddress(collection),
			minter: convertUnionToEthereumAddress(minter),
		})
		return nftTokenId.tokenId.toString()
	}
}
