import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types"
import type { FlowNetwork } from "@rarible/flow-sdk"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import {
  convertFlowContractAddress,
  parseFlowAddressFromUnionAddress,
  parseFlowItemIdFromUnionItemId,
} from "./common/converters"

export class FlowTransfer {
  constructor(
    private sdk: FlowSdk,
    private network: FlowNetwork,
  ) {
    this.transfer = this.transfer.bind(this)
    this.transferBasic = this.transferBasic.bind(this)
  }

  async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
    const { itemId, contract } = parseFlowItemIdFromUnionItemId(prepare.itemId)

    return {
      multiple: false,
      maxAmount: toBigNumber("1"),
      nftData: {
        nftCollection: convertFlowContractAddress(contract),
      },
      submit: Action.create({
        id: "transfer" as const,
        run: async (request: Omit<TransferRequest, "amount">) => {
          const toEVMAddress = parseFlowAddressFromUnionAddress(request.to)
          // @todo remove parseInt when strings are supports by flow-sdk
          const tx = await this.sdk.nft.transfer(contract, parseInt(itemId), toEVMAddress)
          return new BlockchainFlowTransaction(tx, this.network)
        },
      }),
    }
  }

  async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.transfer(request)
    return response.submit(request)
  }
}
