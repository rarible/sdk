import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toEVMAddress, toBigNumber, toUnionContractAddress } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Maybe } from "@rarible/types"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import type { IApisSdk } from "../../domain"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import {
  checkWalletBlockchain,
  convertToEthereumAddress,
  getEthereumItemId,
  getWalletNetwork,
  isEVMBlockchain,
} from "./common"

export class EthereumTransfer {
  constructor(
    private sdk: RaribleSdk,
    private wallet: Maybe<EthereumWallet>,
    private apis: IApisSdk,
  ) {
    this.transfer = this.transfer.bind(this)
    this.transferBasic = this.transferBasic.bind(this)
  }

  async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
    const { contract, tokenId, domain } = getEthereumItemId(prepare.itemId)
    if (!isEVMBlockchain(domain)) {
      throw new Error(`Not an ethereum item: ${prepare.itemId}`)
    }

    const [item, collection] = await Promise.all([
      this.apis.item.getItemById({ itemId: prepare.itemId }),
      this.apis.collection.getCollectionById({ collection: `${domain}:${contract}` }),
    ])

    return {
      multiple: collection.type === "ERC1155",
      maxAmount: item.supply,
      nftData: {
        nftCollection: item.collection ? toUnionContractAddress(item.collection) : undefined,
      },
      submit: Action.create({
        id: "transfer" as const,
        run: async (request: TransferRequest) => {
          await checkWalletBlockchain(this.wallet, domain)
          const amount = request.amount !== undefined ? toBigNumber(request.amount.toFixed()) : undefined

          const tx = await this.sdk.nft.transfer(
            {
              contract: toEVMAddress(contract),
              tokenId: tokenId,
            },
            convertToEthereumAddress(request.to),
            amount,
          )

          return new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
        },
      }),
    }
  }

  async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.transfer(request)
    return response.submit(request)
  }
}
