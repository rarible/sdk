import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import type { Address, ContractAddress, UnionAddress } from "@rarible/types"
import { toAddress } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Blockchain } from "@rarible/api-client"
import type { DeployTokenRequest } from "../../types/nft/deploy/domain"
import type { EthereumDeployTokenAsset } from "../../types/nft/deploy/domain"
import { convertEthereumContractAddress } from "./common"

export class EthereumDeploy {
	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.startDeployToken = this.startDeployToken.bind(this)
	}

	convertOperatorsAddresses(operators: UnionAddress[]): Address[] {
		return operators.map(o => {
			const [blockchain, address] = o.split(":")
			if (blockchain !== "ETHEREUM") {
				throw new Error("Operator address should be in ethereum blockchain")
			}
			return toAddress(address)
		})
	}

	convertDeployResponse(
		response: { tx: EthereumTransaction, address: Address },
	): { tx: BlockchainEthereumTransaction, address: ContractAddress } {
		return {
			tx: new BlockchainEthereumTransaction(response.tx, this.network),
			address: convertEthereumContractAddress(response.address),
		}
	}

	async startDeployToken(asset: EthereumDeployTokenAsset): Promise<{ tx: EthereumTransaction, address: Address }> {
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

	deployToken = Action.create({
		id: "send-tx" as const,
		run: async (request: DeployTokenRequest) => {
			if (request.blockchain !== Blockchain.ETHEREUM) {
				throw new Error("Wrong blockchain")
			}
			return this.convertDeployResponse(
				await this.startDeployToken(request.asset as EthereumDeployTokenAsset)
			)
		},
	})

}
