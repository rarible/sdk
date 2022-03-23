import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toBigNumber, toItemId } from "@rarible/types"
import { BlockchainSolanaTransaction, BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { BurnRequest, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { PrepareTransferRequest, PrepareTransferResponse, TransferRequest } from "../../types/nft/transfer/domain"
import { extractPublicKey } from "./common/address-converters"

export class SolanaNft {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {

	}

	getCollectionId(prepareRequest: PrepareMintRequest) {
		if ("collection" in prepareRequest) {
			return extractPublicKey(prepareRequest.collection.id)
		} else {
			return extractPublicKey(prepareRequest.collectionId)
		}
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
						maxSupply: request.supply,
						collection: this.getCollectionId(prepareRequest),
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

	async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

		return {
			multiple: true, //todo check
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					const amount = request?.amount ?? 1
					const mint = extractPublicKey(item.id)
					const tokenAccount = await this.sdk.balances.getTokenBalance(this.wallet!.provider.publicKey, mint)

					const result = await this.sdk.nft.burn({
						mint: mint,
						signer: this.wallet!.provider,
						amount: amount,
						closeAssociatedAccount: false, // should be set true if all tokens burn
						tokenAccount: tokenAccount.value[0]?.pubkey,
					})

					return new BlockchainSolanaTransaction(result, this.sdk)
				},
			}),
		}
	}

	async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

		return {
			multiple: true, //todo check
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const amount = request?.amount ?? 1
					const mint = extractPublicKey(item.id)
					const tokenAccount = await this.sdk.balances.getTokenBalance(this.wallet!.provider.publicKey, mint)

					const result = await this.sdk.nft.transfer({
						mint: mint,
						signer: this.wallet!.provider,
						amount: amount,
						tokenAccount: tokenAccount.value[0]?.pubkey,
						to: extractPublicKey(request.to),
					})

					return new BlockchainSolanaTransaction(result, this.sdk)
				},
			}),
		}
	}
}
