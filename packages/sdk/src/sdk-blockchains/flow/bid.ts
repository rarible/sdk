import type { FlowItemId, FlowSdk } from "@rarible/flow-sdk"
import { toFlowContractAddress } from "@rarible/types"
import { Action } from "@rarible/action"
import { toFlowItemId } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type * as OrderCommon from "../../types/order/common"
import type { CurrencyType } from "../../common/domain"
import type {
  GetConvertableValueResult,
  PrepareBidRequest,
  PrepareBidResponse,
  PrepareBidUpdateResponse,
} from "../../types/order/bid/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { BidSimplifiedRequest } from "../../types/order/bid/simplified"
import type { BidUpdateSimplifiedRequest } from "../../types/order/bid/simplified"
import { convertFlowContractAddress, convertFlowOrderId, getFungibleTokenName, toFlowParts } from "./common/converters"
import { getFlowBaseFee } from "./common/get-flow-base-fee"

export class FlowBid {
  static supportedCurrencies: CurrencyType[] = [
    {
      blockchain: Blockchain.FLOW,
      type: "NATIVE",
    },
  ]

  constructor(private sdk: FlowSdk) {
    this.bid = this.bid.bind(this)
    this.update = this.update.bind(this)
    this.bidBasic = this.bidBasic.bind(this)
    this.bidUpdateBasic = this.bidUpdateBasic.bind(this)
  }

  private async getConvertableValue(): Promise<GetConvertableValueResult> {
    return undefined
  }

  getBidObjectData(prepare: PrepareBidRequest): BidObjectData {
    if ("collectionId" in prepare) {
      throw new Error("Bid collection is not supported")
    }
    if (!prepare.itemId) {
      throw new Error("ItemId has not been specified")
    }

    const [domain, contract, tokenId] = prepare.itemId.split(":")
    if (domain !== Blockchain.FLOW) {
      throw new Error(`Not an flow item: ${prepare.itemId}`)
    }
    const itemId = toFlowItemId(`${contract}:${tokenId}`)
    return { contract, tokenId, itemId }
  }

  async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
    console.log("FLOW BID", prepare)
    const bidObjectData = this.getBidObjectData(prepare)

    const bidAction = Action.create({
      id: "send-tx" as const,
      run: async (bidRequest: OrderCommon.OrderRequest) => {
        return this.bidCommon(bidRequest, bidObjectData)
      },
    }).after(tx => convertFlowOrderId(tx.orderId))

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: FlowBid.supportedCurrencies,
      multiple: false,
      maxAmount: toBigNumber("1"),
      baseFee: getFlowBaseFee(this.sdk),
      getConvertableValue: this.getConvertableValue,
      supportsExpirationDate: false,
      shouldTransferFunds: false,
      submit: bidAction,
    }
  }

  async bidCommon(bidRequest: OrderCommon.OrderRequest, bidObjectData: BidObjectData) {
    const requestCurrency = getCurrencyAssetType(bidRequest.currency)
    if (requestCurrency["@type"] === "FLOW_FT") {
      const currency = getFungibleTokenName(requestCurrency.contract)
      return this.sdk.order.bid(
        toFlowContractAddress(bidObjectData.contract),
        currency,
        bidObjectData.itemId,
        toBigNumber(bidRequest.price.toString()),
        toFlowParts(bidRequest.originFees),
      )
    }
    throw new Error(`Unsupported currency type: ${requestCurrency["@type"]}`)
  }

  async update(prepareRequest: OrderCommon.PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
    if (!prepareRequest.orderId) {
      throw new Error("OrderId has not been specified")
    }
    const [blockchain, orderId] = prepareRequest.orderId.split(":")
    if (blockchain !== Blockchain.FLOW) {
      throw new Error("Not an flow order")
    }
    const order = await this.sdk.apis.order.getOrderByOrderId({ orderId })

    const bidUpdateAction = Action.create({
      id: "send-tx" as const,
      run: async (bidRequest: OrderCommon.OrderUpdateRequest) => {
        if (order.make["@type"] === "fungible") {
          const currency = getFungibleTokenName(convertFlowContractAddress(order.make.contract))
          return this.sdk.order.bidUpdate(
            toFlowContractAddress(order.take.contract),
            currency,
            order,
            toBigNumber(bidRequest.price.toString()),
          )
        }
        throw new Error(`Unsupported currency type: ${order.make["@type"]}`)
      },
    }).after(tx => convertFlowOrderId(tx.orderId))

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: FlowBid.supportedCurrencies,
      baseFee: getFlowBaseFee(this.sdk),
      getConvertableValue: this.getConvertableValue,
      submit: bidUpdateAction,
      orderData: {
        nftCollection: "contract" in order.take ? convertFlowContractAddress(order.take.contract) : undefined,
      },
    }
  }

  async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
    const bidObjectData = this.getBidObjectData(request)
    const bidTx = await this.bidCommon(request, bidObjectData)
    return convertFlowOrderId(bidTx.orderId)
  }

  async bidUpdateBasic(request: BidUpdateSimplifiedRequest): Promise<OrderId> {
    const updateResponse = await this.update(request)
    return updateResponse.submit(request)
  }
}

type BidObjectData = {
  contract: string
  tokenId: string
  itemId: FlowItemId
}
