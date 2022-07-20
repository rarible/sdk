import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import type { Address, ContractAddress, UnionAddress } from "@rarible/types"
import { toAddress } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Blockchain } from "@rarible/api-client"
import type { CreateCollectionRequest, EthereumCreateCollectionAsset } from "../../types/nft/deploy/domain"
import type { EVMBlockchain, CreateEthereumCollectionResponse } from "./common"
import { convertEthereumContractAddress, getEVMBlockchain } from "./common"

export class EthereumCreateCollection {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
		this.startCreateCollection = this.startCreateCollection.bind(this)
	}

	convertOperatorsAddresses(operators: UnionAddress[]): Address[] {
		if (!operators) {
			throw new Error("Operators should be provided in case of deploy private collection")
		}
		return operators.map(o => {
			const [blockchain, address] = o.split(":")
			if (blockchain !== "ETHEREUM") {
				throw new Error("Operator address should be in ethereum blockchain")
			}
			return toAddress(address)
		})
	}

	private convertResponse(
		response: { tx: EthereumTransaction, address: Address },
	): { tx: BlockchainEthereumTransaction, address: ContractAddress } {
		return {
			tx: new BlockchainEthereumTransaction(response.tx, this.network),
			address: convertEthereumContractAddress(response.address, this.blockchain),
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

	createCollection = Action.create({
		id: "send-tx" as const,
		run: async (request: CreateCollectionRequest) => {
			if (request.blockchain !== Blockchain.ETHEREUM && request.blockchain !== Blockchain.POLYGON) {
				throw new Error("Wrong blockchain")
			}
			return this.convertResponse(
				await this.startCreateCollection(request.asset as EthereumCreateCollectionAsset)
			)
		},
	})

}
