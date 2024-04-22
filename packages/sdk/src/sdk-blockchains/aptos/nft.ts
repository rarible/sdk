import type { AptosSdk } from "@rarible/aptos-sdk"
import { Action } from "@rarible/action"
import { toBigNumber, toContractAddress, toItemId } from "@rarible/types"
import { extractId } from "@rarible/sdk-common"
import { BlockchainAptosTransaction } from "@rarible/sdk-transaction"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/build/domain"
import { Blockchain } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse, OffChainMintResponse, OnChainMintResponse } from "../../types/nft/mint/prepare"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import { MintType } from "../../types/nft/mint/prepare"
import type { IApisSdk } from "../../domain"
import { getCollectionId } from "../../common/get-collection-id"
import type { CreateCollectionRequest, ICreateCollectionAction } from "../../types/nft/deploy/domain"
import type { PrepareTransferRequest, PrepareTransferResponse, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import type {
	MintSimplifiedRequest,
	MintSimplifiedRequestOffChain,
	MintSimplifiedRequestOnChain,
} from "../../types/nft/mint/simplified"
import type { CreateCollectionResponse } from "../../types/nft/deploy/domain"
import type { AptosCreateCollectionSimplified } from "../../types/nft/deploy/simplified"
import type { BurnResponse, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"

export class AptosNft {
	constructor(
		private readonly sdk: AptosSdk,
		private readonly network: AptosSdkEnv,
		private readonly apis: IApisSdk,
	) {
		this.createCollectionBasic = this.createCollectionBasic.bind(this)
		this.mint = this.mint.bind(this)
		this.burn = this.burn.bind(this)
		this.burnBasic = this.burnBasic.bind(this)
		this.transfer = this.transfer.bind(this)
		// this.preprocessMeta = this.preprocessMeta.bind(this)
		this.mintBasic = this.mintBasic.bind(this)
		this.transferBasic = this.transferBasic.bind(this)
	}

	async createCollectionBasic(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
		const { name, description, uri } = request as AptosCreateCollectionSimplified
		const { tx, collectionAddress } = await this.sdk.nft.createCollection({
			name,
			description,
			uri,
		})

		return {
			tx: new BlockchainAptosTransaction(tx, this.network, this.sdk),
			address: toContractAddress(`${Blockchain.APTOS}:${collectionAddress}`),
		}
	}

	// eslint-disable-next-line no-dupe-class-members
	mintBasic(request: MintSimplifiedRequestOnChain): Promise<OnChainMintResponse>;
	// eslint-disable-next-line no-dupe-class-members
	mintBasic(request: MintSimplifiedRequestOffChain): Promise<OffChainMintResponse>;
	// eslint-disable-next-line no-dupe-class-members
	async mintBasic(request: MintSimplifiedRequest) {
  	const prepareResponse = await this.mint(request)
  	return prepareResponse.submit(request)
	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
  	return {
  		multiple: false,
  		supportsRoyalties: false,
  		supportsLazyMint: false,
  		submit: Action.create({
  			id: "mint" as const,
  			run: async (request: MintRequest) => {
  				const unionColectionId = getCollectionId(prepareRequest)
  				// const collection = await this.apis.collection.getCollectionById({
  				// 	collection: unionColectionId,
  				// })
  				const aptosCollectionId = extractId(unionColectionId)
  				const { tx, tokenAddress } = await this.sdk.nft.mintWithCollectionAddress({
  					collectionAddress: aptosCollectionId,
  					name: "",
  					description: "",
  					uri: request.uri,
  				})

  				return {
  					type: MintType.ON_CHAIN,
  					transaction: new BlockchainAptosTransaction(tx, this.network, this.sdk),
  					itemId: toItemId(`${Blockchain.APTOS}:${tokenAddress}`),
  				}
  			},
  		}),
  	}
	}

	async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
  	const response = await this.transfer(request)
  	return response.submit(request)
	}
	async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
  	const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

  	return {
  		multiple: parseFloat(item.supply) > 1,
  		maxAmount: toBigNumber(item.supply),
  		submit: Action.create({
  			id: "transfer" as const,
  			run: async (request: TransferRequest) => {
  				const aptosNftId = extractId(item.id)

  				const tx = await this.sdk.nft.transfer(
  					aptosNftId,
  					request.to,
  				)

  				return new BlockchainAptosTransaction(tx, this.network, this.sdk)
  			},
  		}),
  	}
	}

	async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
  	const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

  	return {
  		multiple: parseFloat(item.supply) > 1,
  		maxAmount: toBigNumber(item.supply),
  		submit: Action.create({
  			id: "burn" as const,
  			run: async () => {
  				const aptosItemId = extractId(prepare.itemId)
  				const tx = await this.sdk.nft.burn(aptosItemId)

  				return new BlockchainAptosTransaction(tx, this.network, this.sdk)
  			},
  		}),
  	}
	}

	async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
  	const response = await this.burn(request)
  	return response.submit(request)
	}

}
