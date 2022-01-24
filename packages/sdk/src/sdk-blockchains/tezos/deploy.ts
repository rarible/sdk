import type { DeployResult, TezosNetwork } from "@rarible/tezos-sdk/dist/common/base"
import { Action } from "@rarible/action"
import type { TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { deploy_mt_private, deploy_mt_public, deploy_nft_private, deploy_nft_public } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import type { DeployTokenRequest, IDeploy } from "../../types/nft/deploy/domain"
import type { TezosDeployTokenAsset } from "../../types/nft/deploy/domain"
import type { MaybeProvider } from "./common"
import { convertTezosToContractAddress, getRequiredProvider } from "./common"

export class TezosDeploy {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private network: TezosNetwork,
	) {}

	private async getDeployOperation(asset: TezosDeployTokenAsset): Promise<DeployResult> {
		const provider = getRequiredProvider(this.provider)
		const owner = await provider.tezos.address()
		const meta = {
			name: asset.arguments.name,
			symbol: asset.arguments.symbol,
			contractURI: asset.arguments.contractURI,
		}

		if (asset.assetType === "NFT") {
			if (!asset.arguments.isUserToken) {
				return deploy_nft_public(provider, owner, meta)
			} else {
				return deploy_nft_private(provider, owner, meta)
			}
		} else if (asset.assetType === "MT") {
			if (!asset.arguments.isUserToken) {
				return deploy_mt_public(provider, owner, meta)
			} else {
				return deploy_mt_private(provider, owner, meta)
			}
		} else {
			throw new Error(`Unsupported asset type=${asset.assetType}`)
		}
	}

	deployToken: IDeploy = Action.create({
		id: "send-tx" as const,
		run: async (request: DeployTokenRequest) => {
			if (request.blockchain !== Blockchain.TEZOS) {
				throw new Error("Wrong blockchain")
			}
			const operationResult = await this.getDeployOperation(request.asset as TezosDeployTokenAsset)
			return {
				tx: new BlockchainTezosTransaction(operationResult, this.network),
				address: convertTezosToContractAddress(operationResult.contract),
			}
		},
	})
}
