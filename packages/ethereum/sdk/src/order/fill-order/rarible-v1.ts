import type { EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumSendOptions } from "@rarible/ethereum-provider"
import { toBigNumber, toBinary, EVM_ZERO_ADDRESS } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { Maybe } from "@rarible/types"
import { approve } from "../approve"
import type { SendFunction } from "../../common/send-transaction"
import type { SimpleLegacyOrder } from "../types"
import { getAssetWithFee } from "../get-asset-with-fee"
import { createExchangeV1Contract } from "../contracts/exchange-v1"
import { toLegacyAssetType } from "../to-legacy-asset-type"
import { toVrs } from "../../common/to-vrs"
import { waitTx } from "../../common/wait-tx"
import type { SimpleOrder } from "../types"
import type { IRaribleEthereumSdkConfig } from "../../types"
import type { GetConfigByChainId } from "../../config"
import type { RaribleEthereumApis } from "../../common/apis"
import { invertOrder } from "./invert-order"
import type { LegacyOrderFillRequest, OrderFillSendData, OrderHandler } from "./types"

export class RaribleV1OrderHandler implements OrderHandler<LegacyOrderFillRequest> {
  constructor(
    private readonly ethereum: Maybe<Ethereum>,
    private readonly getApis: () => Promise<RaribleEthereumApis>,
    private readonly send: SendFunction,
    private readonly getConfig: GetConfigByChainId,
    private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
    private readonly sdkConfig?: IRaribleEthereumSdkConfig,
  ) {}

  invert(request: LegacyOrderFillRequest, maker: EVMAddress): SimpleLegacyOrder {
    const inverted = invertOrder(request.order, request.amount, maker)
    inverted.data = {
      dataType: "LEGACY",
      fee: request.originFee,
    }
    return inverted
  }

  async approve(order: SimpleLegacyOrder, infinite: boolean): Promise<void> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const withFee = getAssetWithFee(order.make, this.getOrderFee(order))
    await waitTx(approve(this.ethereum, this.send, () => this.getConfig(), order.maker, withFee, infinite))
  }

  async getFillOrderBaseFee(): Promise<number> {
    return this.getBaseOrderFeeConfig("RARIBLE_V1")
  }

  getOrderFee(order: SimpleLegacyOrder): number {
    return order.data.fee
  }

  async getTransactionData(
    initial: SimpleLegacyOrder,
    inverted: SimpleLegacyOrder,
    request: LegacyOrderFillRequest,
  ): Promise<OrderFillSendData> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const apis = await this.getApis()
    const buyerFeeSig = await apis.order.buyerFeeSignature({
      fee: inverted.data.fee,
      orderForm: {
        ...initial,
        salt: toBigNumber(toBn(initial.salt).toString()),
        signature: initial.signature || toBinary("0x"),
        end: initial.end!,
      },
    })
    const config = await this.getConfig()
    const exchangeContract = createExchangeV1Contract(this.ethereum, config.exchange.v1)
    const functionCall = exchangeContract.functionCall(
      "exchange",
      toStructLegacyOrder(initial),
      toVrs(initial.signature!),
      inverted.data.fee,
      toVrs(buyerFeeSig),
      inverted.take.value,
      request.payout ?? EVM_ZERO_ADDRESS,
    )
    const options = getMatchV1Options(inverted)

    return {
      functionCall,
      options,
    }
  }
}

function getMatchV1Options(order: SimpleLegacyOrder): EthereumSendOptions {
  if (order.make.assetType.assetClass === "ETH") {
    const makeAsset = getAssetWithFee(order.make, order.data.fee)
    return { value: makeAsset.value }
  } else {
    return {}
  }
}

export function toStructLegacyOrder(order: SimpleLegacyOrder) {
  if (order.type !== "RARIBLE_V1") {
    throw new Error(`Not supported type: ${order.type}`)
  }
  const data = order.data
  if (data.dataType !== "LEGACY") {
    throw new Error(`Not supported data type: ${data.dataType}`)
  }
  return {
    key: toStructLegacyOrderKey(order),
    selling: order.make.value,
    buying: order.take.value,
    sellerFee: data.fee,
  }
}

export function toStructLegacyOrderKey(order: SimpleLegacyOrder) {
  return {
    owner: order.maker,
    salt: order.salt,
    sellAsset: toLegacyAssetType(order.make.assetType),
    buyAsset: toLegacyAssetType(order.take.assetType),
  }
}
