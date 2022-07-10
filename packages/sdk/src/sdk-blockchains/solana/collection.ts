import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { toContractAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { CreateCollectionRequest, ICreateCollection } from "../../types/nft/deploy/domain"
import type { SolanaCreateCollectionTokenAsset } from "../../types/nft/deploy/domain"
import type { ISolanaSdkConfig } from "./domain"

export class SolanaCollection {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
	}

	createCollection: ICreateCollection = Action.create({
		id: "send-tx" as const,
		run: async (request: CreateCollectionRequest) => {
			if (request.blockchain !== Blockchain.SOLANA) {
				throw new Error("Wrong blockchain")
			}

			const mintPrepare = await this.sdk.nft.mint({
				metadataUrl: (request.asset as SolanaCreateCollectionTokenAsset).arguments.metadataURI,
				signer: this.wallet!.provider,
				masterEditionSupply: 0,
				collection: null,
			})

			const res = await mintPrepare.tx.submit("confirmed")

			const collectionAddress = `SOLANA:${mintPrepare.mint.toString()}`

			try {
				// calling this to let backend know what mint is actually created as a collection
				await this.apis.collection.refreshCollectionMeta({
					collection: collectionAddress,
				})
			} catch (e) {
			}

			return {
				tx: new BlockchainSolanaTransaction(res, this.sdk),
				address: toContractAddress(`SOLANA:${mintPrepare.mint.toString()}`),
			}
		},
	})
}
