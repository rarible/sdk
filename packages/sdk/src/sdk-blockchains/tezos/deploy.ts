import type { OperationResult } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import type { TezosProvider } from "tezos-sdk-module"
// eslint-disable-next-line camelcase
import { deploy_mt_private, deploy_mt_public, deploy_nft_private, deploy_nft_public } from "tezos-sdk-module"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import { toContractAddress } from "@rarible/types"
import type { DeployTokenRequest } from "../../types/nft/deploy/domain"
import type { IDeploy } from "../../types/nft/deploy/domain"
import type { TezosDeployTokenAsset } from "../../types/nft/deploy/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import { getRequiredProvider, getTezosAddress } from "./common"

export class TezosDeploy {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {}

	private async getDeployOperation(asset: TezosDeployTokenAsset): Promise<OperationResult> {
		const provider = getRequiredProvider(this.provider)
		const owner = getTezosAddress(asset.arguments.owner)

		if (asset.assetType === "NFT") {
			if (asset.arguments.isPublicCollection) {
				return deploy_nft_public(provider, owner)
			} else {
				return deploy_nft_private(provider, owner)
			}
		} else if (asset.assetType === "MT") {
			if (asset.arguments.isPublicCollection) {
				return deploy_mt_public(provider, owner)
			} else {
				return deploy_mt_private(provider, owner)
			}
		} else {
			throw new Error(`Unsupported asset type=${asset.assetType}`)
		}
	}

	deployToken: IDeploy = Action.create({
		id: "send-tx" as const,
		run: async (request: DeployTokenRequest) => {
			if (request.blockchain !== "TEZOS") {
				throw new Error("Wrong blockchain")
			}
			const operationResult = await this.getDeployOperation(request.asset)
			if (!operationResult.contract) {
				throw new Error("Contract address has not been returned")
			}
			return {
				tx: new BlockchainTezosTransaction(operationResult),
				address: toContractAddress(`TEZOS:${operationResult.contract}`),
			}
		},
	})
}
