import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { toBigNumber, toItemId } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import { MintType } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { BurnRequest, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { PrepareTransferRequest, PrepareTransferResponse, TransferRequest } from "../../types/nft/transfer/domain"
import type { CommonTokenContent, PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import { extractPublicKey } from "./common/address-converters"
import type { ISolanaSdkConfig } from "./domain"
import type { ISolanaMetadataResponse } from "./domain"

export class SolanaNft {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
		this.mint = this.mint.bind(this)
		this.burn = this.burn.bind(this)
		this.transfer = this.transfer.bind(this)
		this.preprocessMeta = this.preprocessMeta.bind(this)
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

		return {
			multiple: false,
			supportsRoyalties: false,
			supportsLazyMint: false,
			submit: Action.create({
				id: "mint" as const,
				run: async (request: MintRequest) => {
					const collectionId = this.getCollectionId(prepareRequest)
					const transactions = []

					const mintPrepare = await this.sdk.nft.mint({
						signer: this.wallet!.provider,
						metadataUrl: request.uri,
						masterEditionSupply: 0,
						collection: collectionId,
					})

					transactions.push(mintPrepare.tx)

					// verify collection
					if (collectionId) {
						transactions.push(await this.sdk.collection.verifyCollection({
							signer: this.wallet!.provider,
							collection: collectionId,
							mint: mintPrepare.mint,
						}))
					}

					const res = await this.sdk.unionInstructionsAndSend(
						this.wallet!.provider,
						transactions,
						"processed"
					)

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainSolanaTransaction(res, this.sdk),
						itemId: toItemId(`SOLANA:${mintPrepare.mint.toString()}`),
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
			multiple: parseFloat(item.supply) > 1,
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					const amount = request?.amount ?? 1
					const mint = extractPublicKey(item.id)

					const prepare = await this.sdk.nft.burn({
						mint: mint,
						signer: this.wallet!.provider,
						amount: amount,
						closeAssociatedAccount: false, // todo should be set true if all tokens burn
					})
					const tx = await prepare.submit("processed")

					return new BlockchainSolanaTransaction(tx, this.sdk)
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
			multiple: parseFloat(item.supply) > 1,
			maxAmount: toBigNumber(item.supply),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const amount = request?.amount ?? 1
					const mint = extractPublicKey(item.id)

					const prepare = await this.sdk.nft.transfer({
						mint: mint,
						signer: this.wallet!.provider,
						amount: amount,
						to: extractPublicKey(request.to),
					})
					const tx = await prepare.submit("processed")

					return new BlockchainSolanaTransaction(tx, this.sdk)
				},
			}),
		}
	}

	preprocessMeta(meta: PreprocessMetaRequest): ISolanaMetadataResponse {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		if (meta.blockchain !== Blockchain.SOLANA) {
			throw new Error("Wrong blockchain")
		}

		return {
			"name": meta.name,
			"symbol": meta.symbol,
			"description": meta.description,
			"seller_fee_basis_points": (meta.royalties?.value ?? 0) * 100,
			"image": meta.image?.url,
			"animation_url": meta.animation?.url,
			"external_url": meta.external,
			"attributes": meta.attributes?.map((a) => ({
				"trait_type": a.key,
				"value": a.value,
			})),
			"properties": {
				"files": ([meta.image, meta.animation]
					.filter((f) => f !== undefined) as CommonTokenContent[])
					.map((file ) => {
						return {
							uri: file.url,
							type: file.mimeType,
						}
					}),
				"creators": [{
					address: this.wallet.provider.publicKey.toString(),
					share: 100,
				}],
			},
		}
	}
}
