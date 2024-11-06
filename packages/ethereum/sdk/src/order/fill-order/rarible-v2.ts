import type { EVMAddress, Address } from "@rarible/types"
import type { Part } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumSendOptions } from "@rarible/ethereum-provider"
import { ZERO_WORD } from "@rarible/types"
import type { Maybe } from "@rarible/types"
import { hashToSign, orderToStruct, signOrder } from "../sign-order"
import { getAssetWithFee } from "../get-asset-with-fee"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import { createExchangeV2Contract } from "../contracts/exchange-v2"
import { waitTx } from "../../common/wait-tx"
import type { SimpleOrder, SimpleRaribleV2Order } from "../types"
import { isSigner } from "../../common/is-signer"
import { fixSignature } from "../../common/fix-signature"
import { isETH, isWeth } from "../../nft/common"
import type { GetConfigByChainId } from "../../config"
import { getNetworkConfigByChainId } from "../../config"
import { CURRENT_ORDER_TYPE_VERSION } from "../../common/order"
import { encodeRaribleV2OrderPurchaseStruct } from "./rarible-v2/encode-rarible-v2-order"
import { invertOrder } from "./invert-order"
import type {
  OrderFillSendData,
  OrderHandler,
  PreparedOrderRequestDataForExchangeWrapper,
  RaribleV2OrderFillRequest,
  RaribleV2OrderFillRequestV2,
  RaribleV2OrderFillRequestV3,
} from "./types"
import { ExchangeWrapperOrderType } from "./types"
import { setFeesCurrency, ZERO_FEE_VALUE } from "./common/origin-fees-utils"

export class RaribleV2OrderHandler implements OrderHandler<RaribleV2OrderFillRequest> {
  constructor(
    private readonly ethereum: Maybe<Ethereum>,
    private readonly send: SendFunction,
    private readonly getConfig: GetConfigByChainId,
    private readonly getBaseFee: (type: SimpleOrder["type"]) => Promise<number>,
  ) {}

  async invert(request: RaribleV2OrderFillRequest, maker: Address | EVMAddress): Promise<SimpleRaribleV2Order> {
    const inverted = invertOrder(request.order, request.amount, maker)
    switch (request.order.data.dataType) {
      case "RARIBLE_V2_DATA_V1": {
        inverted.data = {
          dataType: "RARIBLE_V2_DATA_V1",
          originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
          payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
        }
        break
      }
      case "RARIBLE_V2_DATA_V2": {
        const v3 = await this.shouldUseV3(request.originFees)
        inverted.data = {
          dataType: v3 ? "RARIBLE_V2_DATA_V3" : "RARIBLE_V2_DATA_V2",
          originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
          payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
          isMakeFill: !request.order.data.isMakeFill,
        }
        break
      }
      case "RARIBLE_V2_DATA_V3": {
        const v3 = await this.shouldUseV3(request.originFees)
        inverted.data = {
          dataType: v3 ? "RARIBLE_V2_DATA_V3" : "RARIBLE_V2_DATA_V2",
          originFees: (request as RaribleV2OrderFillRequestV3).originFees || [],
          payouts: (request as RaribleV2OrderFillRequestV3).payouts || [],
          isMakeFill: !request.order.data.isMakeFill,
        }
        break
      }
      default:
        throw new Error("Unsupported order dataType")
    }
    return inverted
  }

  private async shouldUseV3(fees?: Part[]): Promise<boolean> {
    const originFees = (fees || []).reduce((sum, prev) => sum + prev.value, 0)
    //should not use v3 as order doesn't have fees, so protocol also should not take any fees
    if (originFees === 0) {
      return false
    }
    const baseFee = await this.getBaseFee(CURRENT_ORDER_TYPE_VERSION)
    //if base fee is non-zero, then use v3 (with protocol fees), otherwise use v2 (without fees)
    return baseFee !== 0
  }

  getAssetToApprove(inverted: SimpleRaribleV2Order) {
    return this.getMakeAssetWithFee(inverted)
  }
  async approve(order: SimpleRaribleV2Order, infinite: boolean): Promise<void> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const withFee = await this.getMakeAssetWithFee(order)
    await waitTx(approve(this.ethereum, this.send, () => this.getConfig(), order.maker, withFee, infinite))
  }

  async getTransactionData(initial: SimpleRaribleV2Order, inverted: SimpleRaribleV2Order): Promise<OrderFillSendData> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const config = await this.getConfig()
    const exchangeContract = createExchangeV2Contract(this.ethereum, config.exchange.v2)

    const functionCall = exchangeContract.functionCall(
      "matchOrders",
      await this.fixForTx(initial),
      fixSignature(initial.signature) || "0x",
      orderToStruct(this.ethereum, inverted),
      fixSignature(inverted.signature) || "0x",
    )

    const options = await this.getMatchV2Options(initial, inverted)

    return {
      functionCall,
      options,
    }
  }

  async getTransactionDataForExchangeWrapper(
    initial: SimpleRaribleV2Order,
    inverted: SimpleRaribleV2Order,
  ): Promise<PreparedOrderRequestDataForExchangeWrapper> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const config = await this.getConfig()
    if (!initial.signature) {
      initial.signature = await signOrder(this.ethereum, () => this.getConfig(), initial)
    }

    // fix payouts to send bought item to buyer
    if (
      inverted.data.dataType === "RARIBLE_V2_DATA_V1" ||
      inverted.data.dataType === "RARIBLE_V2_DATA_V2" ||
      inverted.data.dataType === "RARIBLE_V2_DATA_V3"
    ) {
      if (!inverted.data.payouts?.length) {
        inverted.data.payouts = [
          {
            account: inverted.maker,
            value: 10000,
          },
        ]
      }
    }

    const signature = fixSignature(initial.signature) || "0x"
    const callData = encodeRaribleV2OrderPurchaseStruct(this.ethereum, initial, signature, inverted, true)
    const options = await this.getMatchV2Options(initial, inverted)

    let fees = ZERO_FEE_VALUE
    // let amount
    const paymentAsset = await this.getMakeAssetWithFee(inverted)
    if (isWeth(initial.take.assetType, config)) {
      fees = setFeesCurrency(fees, true)
    }

    return {
      data: {
        marketId: ExchangeWrapperOrderType.RARIBLE_V2,
        amount: paymentAsset.value,
        fees, // using zero fee because fees already included in callData
        data: callData,
      },
      options,
    }
  }

  async fixForTx(order: SimpleRaribleV2Order): Promise<any> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const config = getNetworkConfigByChainId(await this.ethereum.getChainId())
    const hash = hashToSign(config, this.ethereum, order)
    const isMakerSigner = await isSigner(this.ethereum, order.maker, hash, order.signature!)
    return orderToStruct(this.ethereum, order, !isMakerSigner)
  }

  async getMatchV2Options(left: SimpleRaribleV2Order, right: SimpleRaribleV2Order): Promise<EthereumSendOptions> {
    if (isETH(left.make.assetType) && left.salt === ZERO_WORD) {
      const asset = await this.getMakeAssetWithFee(left)
      return { value: asset.value }
    } else if (isETH(right.make.assetType) && right.salt === ZERO_WORD) {
      const asset = await this.getMakeAssetWithFee(right)
      return { value: asset.value }
    } else {
      return { value: 0 }
    }
  }

  async getMakeAssetWithFee(order: SimpleRaribleV2Order) {
    return getAssetWithFee(order.make, await this.getOrderFee(order))
  }

  async getOrderFee(order: SimpleRaribleV2Order): Promise<number> {
    switch (order.data.dataType) {
      case "RARIBLE_V2_DATA_V1":
      case "RARIBLE_V2_DATA_V2":
      case "RARIBLE_V2_DATA_V3":
        return (
          order.data.originFees.map(f => f.value).reduce((v, acc) => v + acc, 0) +
          (await this.getBaseFeeByData(order.data))
        )
      default:
        throw new Error("Unsupported order dataType")
    }
  }

  /**
   * Returns which base fee should be used when filling the order
   * If originFees are equal to zero, then protocol fee is not used, so will return 0
   * If originFees not provided we are thinking that protocol fee will be taken
   */
  async getFillOrderBaseFee(_order: RaribleV2OrderFillRequest["order"], originFees?: Part[]): Promise<number> {
    if (originFees === undefined || (await this.shouldUseV3(originFees))) {
      return this.getBaseFee("RARIBLE_V2")
    }
    return 0
  }

  async getBaseFeeByData(data: RaribleV2OrderFillRequest["order"]["data"]): Promise<number> {
    if (data.dataType === "RARIBLE_V2_DATA_V3") {
      return this.getBaseFee("RARIBLE_V2")
    }
    return 0
  }
}
