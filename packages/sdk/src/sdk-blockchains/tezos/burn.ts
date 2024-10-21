import { toBigNumber } from "@rarible/types"
import { Action } from "@rarible/action"
import { burn } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { TezosProvider, TezosNetwork, Provider } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { IApisSdk } from "../../domain"
import type { BurnRequest, BurnResponse, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import {
  getRequestAmount,
  getCollectionTypeAssetClass,
  getTezosItemData,
  isExistedTezosProvider,
  checkChainId,
  convertTezostoUnionContractAddress,
} from "./common"
import type { MaybeProvider } from "./common"
import { getCollectionType } from "./common/get-collection-type"

export class TezosBurn {
  constructor(
    private provider: MaybeProvider<TezosProvider>,
    private unionAPI: IApisSdk,
    private network: TezosNetwork,
  ) {
    this.burn = this.burn.bind(this)
    this.burnBasic = this.burnBasic.bind(this)
  }

  private getRequiredProvider(): Provider {
    if (!isExistedTezosProvider(this.provider)) {
      throw new Error("Tezos provider is required")
    }
    return this.provider
  }

  async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
    await checkChainId(this.provider)

    const { contract, tokenId } = getTezosItemData(prepare.itemId)
    const item = await this.unionAPI.item.getItemById({ itemId: prepare.itemId })
    const collectionType = await getCollectionType(this.provider, contract)

    return {
      multiple: collectionType === "TEZOS_MT",
      maxAmount: toBigNumber(item.supply),
      nftData: {
        nftCollection: item.collection && convertTezostoUnionContractAddress(item.collection),
      },
      submit: Action.create({
        id: "burn" as const,
        run: async (request: BurnRequest) => {
          const result = await burn(
            this.getRequiredProvider(),
            {
              asset_class: getCollectionTypeAssetClass(collectionType),
              contract,
              token_id: new BigNumber(tokenId),
            },
            getRequestAmount(request?.amount, collectionType),
          )

          return new BlockchainTezosTransaction(result, this.network)
        },
      }),
    }
  }

  async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
    const response = await this.burn(request)
    return response.submit(request)
  }
}
