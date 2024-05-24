import type { AptosSdk, AptosSdkEnv } from "@rarible/aptos-sdk"
import { Action } from "@rarible/action"
import { extractId } from "@rarible/sdk-common"
import { toBn } from "@rarible/utils"
import { APT_DIVIDER } from "@rarible/aptos-sdk"
import type { OrderId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainAptosTransaction } from "@rarible/sdk-transaction"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { BidSimplifiedRequest } from "../../types/order/bid/simplified"
import { getNftContractAddress, getOrderId } from "../../common/utils"
import { convertDateToTimestamp, getDefaultExpirationDateTimestamp } from "../../common/get-expiration-date"
import type { OrderRequest } from "../../types/order/common"
import type { PrepareBidRequest, PrepareBidResponse } from "../../types/order/bid/domain"
import type { IApisSdk } from "../../domain"
import type { AcceptBidSimplifiedRequest } from "../../types/order/fill/simplified"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import { convertAptosToUnionOrderId, getFeeObject, getSupportedCurrencies } from "./common"

export class AptosBid {
  constructor(
    private readonly sdk: AptosSdk,
    private readonly network: AptosSdkEnv,
    private readonly apis: IApisSdk,
  ) {
    this.bid = this.bid.bind(this)
    this.bidBasic = this.bidBasic.bind(this)
    this.acceptBid = this.acceptBid.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
  }

  async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
    const item = "itemId" in prepare ? await this.apis.item.getItemById({ itemId: prepare.itemId }) : null

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderRequest) => {
        const feeObject = await getFeeObject({
          originFees: request.originFees || [],
          defaultFeeAddress: this.sdk.order.getFeeScheduleAddress(),
          createFeeSchedule: this.sdk.order.createFeeSchedule,
        })
        const currencyAssetType = getCurrencyAssetType(request.currency)
        if (currencyAssetType["@type"] !== "CURRENCY_NATIVE") {
          throw new Error("Only native token currency is available for bid operation")
        }
        const expirationDate = request.expirationDate
          ? convertDateToTimestamp(request.expirationDate)
          : getDefaultExpirationDateTimestamp()

        if ("itemId" in prepare) {
          const orderId = await this.sdk.order.tokenOffer(
            extractId(prepare.itemId),
            feeObject,
            expirationDate,
            toBn(request.price.toString()).multipliedBy(APT_DIVIDER).toFixed(),
          )
          return convertAptosToUnionOrderId(orderId)
        } else if ("collectionId" in prepare) {
          const orderId = await this.sdk.order.collectionOffer(
            extractId(prepare["collectionId"]),
            request.amount || 1,
            feeObject,
            expirationDate,
            toBn(request.price.toString()).multipliedBy(APT_DIVIDER).toFixed(),
          )
          return convertAptosToUnionOrderId(orderId)
        } else {
          throw new Error("ItemID or CollectionID was expected")
        }
      },
    })

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: getSupportedCurrencies(),
      multiple: false,
      maxAmount: item ? item.supply : null,
      baseFee: 0,
      getConvertableValue: async () => undefined,
      supportsExpirationDate: true,
      shouldTransferFunds: true,
      submit,
    }
  }

  async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
    const prepare = await this.bid(request)
    return prepare.submit(request)
  }

  async acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    const orderId = getOrderId(request)
    const order = await this.apis.order.getValidatedOrderById({
      id: orderId,
    })
    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        if (Array.isArray(buyRequest.itemId)) {
          throw new Error("Array of itemIds is not supported")
        }
        if (buyRequest.originFees?.length) {
          throw new Error("Origin fees is not supported in acceptBid operation. You can set it during bid")
        }
        if (order.take.type["@type"] === "NFT_OF_COLLECTION") {
          if (!buyRequest.itemId) {
            throw new Error("ItemId property mustn't be empty")
          }
          const tx = await this.sdk.order.acceptCollectionOffer(extractId(orderId), extractId(buyRequest.itemId))
          return new BlockchainAptosTransaction(tx, this.network, this.sdk)
        }
        if (order.take.type["@type"] === "NFT") {
          const tx = await this.sdk.order.acceptTokenOffer(extractId(orderId))
          return new BlockchainAptosTransaction(tx, this.network, this.sdk)
        }
        throw new Error("Type of order is not supported")
      },
    })

    return {
      multiple: false,
      maxAmount: order.makeStock,
      baseFee: 0,
      supportsPartialFill: false,
      originFeeSupport: OriginFeeSupport.NONE,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      submit,
      orderData: {
        platform: order.platform,
        nftCollection: getNftContractAddress(order.take.type),
      },
    }
  }

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.acceptBid(request)
    return response.submit(request)
  }
}
