import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Address, ContractAddress, UnionAddress } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { isEVMBlockchain } from "@rarible/sdk-common"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import { getBlockchainFromChainId, getNetworkFromChainId } from "@rarible/protocol-ethereum-sdk/build/common"
import type { CreateCollectionResponse, EthereumCreateCollectionAsset } from "../../types/nft/deploy/domain"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"
import type {
	EthereumCreatePrivateCollectionSimplified,
	EthereumCreatePublicCollectionSimplified,
} from "../../types/nft/deploy/simplified"
import type { CreateEthereumCollectionResponse } from "./common"
import { assertWallet, convertEthereumContractAddress, convertToEthereumAddress } from "./common"

export class EthereumCreateCollection {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
	) {
		this.createCollectionSimplified = this.createCollectionSimplified.bind(this)
	}

	convertOperatorsAddresses(operators: UnionAddress[]): Address[] {
		if (!operators) {
			throw new Error("Operators should be provided in case of deploy private collection")
		}
		return operators.map(o => convertToEthereumAddress(o))
	}

	private async convertResponse(
		response: { tx: EthereumTransaction, address: Address },
	): Promise<{ tx: BlockchainEthereumTransaction, address: ContractAddress }> {
		const chainId = await assertWallet(this.wallet).ethereum.getChainId()
		const network = await getNetworkFromChainId(chainId)
		const blockchain = await getBlockchainFromChainId(chainId)
		return {
			tx: new BlockchainEthereumTransaction(response.tx, network),
			address: convertEthereumContractAddress(response.address, blockchain),
		}
	}

	async startCreateCollection(asset: EthereumCreateCollectionAsset): Promise<CreateEthereumCollectionResponse> {
		const deployCommonArguments = [
			asset.arguments.name,
			asset.arguments.symbol,
			asset.arguments.baseURI,
			asset.arguments.contractURI,
		] as const

		if (asset.arguments.isUserToken) {

			const operators = this.convertOperatorsAddresses(asset.arguments.operators)

			if (asset.assetType === "ERC721") {
				return this.sdk.nft.deploy.erc721.deployUserToken(
					...deployCommonArguments,
					operators,
				)
			} else if (asset.assetType === "ERC1155") {
				return this.sdk.nft.deploy.erc1155.deployUserToken(
					...deployCommonArguments,
					operators,
				)
			} else {
				throw new Error("Unsupported asset type")
			}

		} else {
			if (asset.assetType === "ERC721") {
				return this.sdk.nft.deploy.erc721.deployToken(...deployCommonArguments)
			} else if (asset.assetType === "ERC1155") {
				return this.sdk.nft.deploy.erc1155.deployToken(...deployCommonArguments)
			} else {
				throw new Error("Unsupported asset type")
			}
		}
	}

	async createCollectionSimplified(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
		if (!isEthereumRequest(request)) {
			throw new Error("Wrong blockchain")
		}

		return this.convertResponse(
			await this.startCreateCollection({
				assetType: request.type,
				arguments: {
					name: request.name,
					symbol: request.symbol,
					baseURI: request.baseURI,
					contractURI: request.contractURI,
					isUserToken: !request.isPublic,
					operators: "operators" in request ? request.operators : [],
				},
			})
		)
	}
}

function isEthereumRequest(
	x: CreateCollectionRequestSimplified
): x is EthereumCreatePublicCollectionSimplified | EthereumCreatePrivateCollectionSimplified {
	return isEVMBlockchain(x.blockchain)
}
