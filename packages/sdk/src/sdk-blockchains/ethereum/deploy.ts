import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import type { Address, ContractAddress, UnionAddress } from "@rarible/types"
import { toAddress, toContractAddress } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { DeployTokenRequest } from "../../types/nft/deploy/domain"
import type { DeployEthereumTokenRequest } from "../../types/nft/deploy/domain"

export class EthereumDeploy {
	constructor(private sdk: RaribleSdk) {
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
			tx: new BlockchainEthereumTransaction(response.tx),
			address: toContractAddress(`ETHEREUM:${response.address}`),
		}
	}

	async startDeployToken(request: DeployEthereumTokenRequest): Promise<{ tx: EthereumTransaction, address: Address }> {
		const deployCommonArguments = [
			request.asset.arguments.name,
			request.asset.arguments.symbol,
			request.asset.arguments.baseURI,
			request.asset.arguments.contractURI,
		] as const

		if (request.asset.arguments.isUserToken) {

			const operators = this.convertOperatorsAddresses(request.asset.arguments.operators)

			if (request.asset.assetType === "ERC721") {
				return this.sdk.nft.deploy.erc721.deployUserToken(
					...deployCommonArguments,
					operators,
				)
			} else if (request.asset.assetType === "ERC1155") {
				return this.sdk.nft.deploy.erc1155.deployUserToken(
					...deployCommonArguments,
					operators,
				)
			} else {
				throw new Error("Unsupported asset type")
			}

		} else {
			if (request.asset.assetType === "ERC721") {
				return this.sdk.nft.deploy.erc721.deployToken(...deployCommonArguments)
			} else if (request.asset.assetType === "ERC1155") {
				return this.sdk.nft.deploy.erc1155.deployToken(...deployCommonArguments)
			} else {
				throw new Error("Unsupported asset type")
			}
		}
	}

	deployToken = Action.create({
		id: "send-tx" as const,
		run: async (request: DeployTokenRequest) => {
			if (request.blockchain !== "ETHEREUM") {
				throw new Error("Wrong blockchain")
			}
			return this.convertDeployResponse(
				await this.startDeployToken(request)
			)
		},
	})

}
