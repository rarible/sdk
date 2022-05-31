import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type {
	CryptopunkUnwrapRequest,
	CryptopunkWrapRequest,
	ICryptopunkUnwrap,
	ICryptopunkWrap,
} from "../../types/ethereum/domain"

export class EthereumCryptopunk {
	constructor(
		private readonly sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {}

	wrap: ICryptopunkWrap = Action.create({
		id: "approve-tx" as const,
		run: async (request: CryptopunkWrapRequest) => {
			if (!request.punkId) {
				throw new Error("PunkId has not been specified")
			}

			const tx = await this.sdk.nft.cryptoPunks.approveForWrapper(request.punkId)
			if (tx) {
				await (new BlockchainEthereumTransaction(tx, this.network)).wait()
			}

			return request
		},
	}).thenStep({
		id: "wrap-tx" as const,
		run: async (request: CryptopunkWrapRequest) => {
			const tx = await this.sdk.nft.cryptoPunks.wrap(request.punkId)
			return new BlockchainEthereumTransaction(tx, this.network)
		},
	})

	unwrap: ICryptopunkUnwrap = Action.create({
		id: "unwrap-tx" as const,
		run: async (request: CryptopunkUnwrapRequest) => {
			if (!request.punkId) {
				throw new Error("PunkId has not been specified")
			}

			const tx = await this.sdk.nft.cryptoPunks.unwrap(request.punkId)
			return new BlockchainEthereumTransaction(tx, this.network)
		},
	})
}
