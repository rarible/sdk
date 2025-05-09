import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toEVMAddress, toBigNumber, toUnionContractAddress } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import { extractBlockchain } from "@rarible/sdk-common"
import type { BurnRequest, PrepareBurnRequest } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import type { BurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { PrepareBurnResponse } from "../../types/nft/burn/domain"
import { checkWalletBlockchain, getEthereumItemId, getWalletNetwork, toEthereumParts } from "./common"

export class EthereumBurn {
  constructor(
    private sdk: RaribleSdk,
    private wallet: Maybe<EthereumWallet>,
    private apis: IApisSdk,
    private network: EthereumNetwork,
  ) {
    this.burn = this.burn.bind(this)
    this.burnBasic = this.burnBasic.bind(this)
  }

  async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
    const { contract, tokenId, domain } = getEthereumItemId(prepare.itemId)
    const blockchain = extractBlockchain(prepare.itemId)

    const [item, collection] = await Promise.all([
      this.apis.item.getItemById({ itemId: prepare.itemId }),
      this.apis.collection.getCollectionById({ collection: `${domain}:${contract}` }),
    ])

    return {
      multiple: collection.type === "ERC1155",
      maxAmount: item.supply,
      nftData: {
        nftCollection: item.collection && toUnionContractAddress(item.collection),
      },
      submit: Action.create({
        id: "burn" as const,
        run: async (request: BurnRequest) => {
          await checkWalletBlockchain(this.wallet, blockchain)
          const amount = request?.amount !== undefined ? toBigNumber(request.amount.toFixed()) : undefined

          const tx = await this.sdk.nft.burn({
            assetType: {
              contract: toEVMAddress(contract),
              tokenId: tokenId,
            },
            amount,
            creators: toEthereumParts(request?.creators),
          })

          return tx && new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
        },
      }),
    }
  }

  async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
    const response = await this.burn(request)
    return response.submit(request)
  }
}
