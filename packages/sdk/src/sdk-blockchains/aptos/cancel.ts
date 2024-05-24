import type { AptosSdk, AptosSdkEnv } from "@rarible/aptos-sdk"
import { extractId } from "@rarible/sdk-common"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainAptosTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import { isNativeToken } from "../../common/utils"

export class AptosCancel {
  constructor(
    private readonly sdk: AptosSdk,
    private readonly network: AptosSdkEnv,
    private readonly apis: IApisSdk,
  ) {
    this.cancel = this.cancel.bind(this)
  }

  cancel = async (request: CancelOrderRequest): Promise<IBlockchainTransaction> => {
    const order = await this.apis.order.getValidatedOrderById({
      id: request.orderId,
    })
    const aptosOrderId = extractId(request.orderId)

    //Sell order
    if (isNativeToken(order.take.type)) {
      const tx = await this.sdk.order.cancel(aptosOrderId)
      return new BlockchainAptosTransaction(tx, this.network, this.sdk)
    }

    //Bid order
    if (isNativeToken(order.make.type)) {
      if (order.take.type["@type"] === "NFT_OF_COLLECTION") {
        const tx = await this.sdk.order.cancelCollectionOffer(aptosOrderId)
        return new BlockchainAptosTransaction(tx, this.network, this.sdk)
      }
      if (order.take.type["@type"] === "NFT") {
        const tx = await this.sdk.order.cancelTokenOffer(aptosOrderId)
        return new BlockchainAptosTransaction(tx, this.network, this.sdk)
      }
    }
    throw new Error("Unrecognized type of order")
  }
}
