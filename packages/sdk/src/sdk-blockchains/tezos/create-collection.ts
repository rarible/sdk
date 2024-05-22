import type { DeployResult, TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { deploy_mt_private, deploy_mt_public, deploy_nft_private, deploy_nft_public } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import type { CreateCollectionRequest, ICreateCollectionAction } from "../../types/nft/deploy/domain"
import type { TezosCreateCollectionTokenAsset } from "../../types/nft/deploy/domain"
import type { CreateCollectionRequestSimplified } from "../../types/nft/deploy/simplified"
import type { CreateCollectionResponse } from "../../types/nft/deploy/domain"
import type { MaybeProvider } from "./common"
import { checkChainId, convertTezosToContractAddress, getRequiredProvider } from "./common"

export class TezosCreateCollection {
  constructor(
    private provider: MaybeProvider<TezosProvider>,
    private network: TezosNetwork,
  ) {
    this.createCollectionSimplified = this.createCollectionSimplified.bind(this)
  }

  private getMetadataJSON(asset: TezosCreateCollectionTokenAsset): string {
    const json: Record<string, any> = {
      name: asset.arguments.name,
      homepage: asset.arguments.homepage,
    }

    if (asset.arguments.description) {
      json["description"] = asset.arguments.description
    }

    if (asset.arguments.license) {
      json["license"] = asset.arguments.license
    }

    if (asset.arguments.version) {
      json["version"] = asset.arguments.version
    }

    if (asset.arguments.authors?.length) {
      json["authors"] = asset.arguments.authors
    }

    return JSON.stringify(json)
  }

  private async getDeployOperation(asset: TezosCreateCollectionTokenAsset): Promise<DeployResult> {
    const provider = getRequiredProvider(this.provider)
    const owner = await provider.tezos.address()
    const meta = {
      "": "tezos-storage:metadata",
      metadata: this.getMetadataJSON(asset),
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

  createCollection: ICreateCollectionAction = Action.create({
    id: "send-tx" as const,
    run: async (request: CreateCollectionRequest) => {
      if (request.blockchain !== Blockchain.TEZOS) {
        throw new Error("Wrong blockchain")
      }
      await checkChainId(this.provider)

      const operationResult = await this.getDeployOperation(request.asset as TezosCreateCollectionTokenAsset)
      return {
        tx: new BlockchainTezosTransaction(operationResult, this.network),
        address: convertTezosToContractAddress(operationResult.contract),
      }
    },
  })

  async createCollectionSimplified(request: CreateCollectionRequestSimplified): Promise<CreateCollectionResponse> {
    if (request.blockchain !== Blockchain.TEZOS) {
      throw new Error("Wrong blockchain")
    }
    const { isPublic, type, ...commonRequest } = request
    const operationResult = await this.getDeployOperation({
      assetType: type,
      arguments: {
        ...commonRequest,
        isUserToken: !isPublic,
      },
    })
    return {
      tx: new BlockchainTezosTransaction(operationResult, this.network),
      address: convertTezosToContractAddress(operationResult.contract),
    }
  }
}
