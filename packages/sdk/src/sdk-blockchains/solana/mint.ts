import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toItemId } from "@rarible/types"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction/src/solana"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"

export class SolanaMint {
	constructor(readonly sdk: SolanaSdk, readonly wallet: Maybe<SolanaWallet>) {

	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		//const {
		//	contract,
		//	type,
		//} = await getCollectionData(this.apis.collection, prepareRequest)

		return {
			multiple: false, // todo: support
			supportsRoyalties: false, // todo: support
			supportsLazyMint: false,
			submit: Action.create({
				id: "mint" as const,
				run: async (request: MintRequest) => {
					const result = await this.sdk.nft.mint({
						metadataUrl: request.uri,
						signer: this.wallet!.provider,
						maxSupply: 1, //request.supply,
						collection: null, // PublicKey | null
					})

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainSolanaTransaction(result, this.sdk),
						itemId: toItemId(`SOLANA:${result.mint.toString()}`),
					}
				},
			}),
		}
	}
}
