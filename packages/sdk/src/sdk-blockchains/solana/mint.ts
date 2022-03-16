import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction/src/solana"
import { IWalletSigner } from "@rarible/solana-wallet"
import { PublicKey } from "@solana/web3.js"
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
					// const royalties = request.royalties?.reduce((acc, royalty) => {
					// 	const account = getTezosAddress(royalty.account)
					// 	acc[account] = new BigNumber(royalty.value)
					// 	return acc
					// }, {} as { [key: string]: BigNumber }) || {}
					//
					// const supply = type === "NFT" ? undefined : toBn(request.supply)
					// const provider = getRequiredProvider(this.provider)
					//
					// const result = await mint(
					// 	provider,
					// 	contract,
					// 	royalties,
					// 	supply,
					// 	undefined,
					// 	{
					// 		"": fixIpfs(request.uri),
					// 	},
					// 	await this.getOwner(request),
					// )
					//


					const result = await this.sdk.nft.mint({
						metadataUrl: request.uri,
						signer: this.wallet!.provider,
						maxSupply: 1, //request.supply,
						collection: null, // PublicKey | null
					})

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainSolanaTransaction(result, this.sdk),
						itemId: toItemId(`SOLANA:${result.mint.toString()}`), //convertTezosItemId(`${result.mint.toString()}`),
					}
				},
			}),
		}
	}
}
