import type { AptosSdk, SupportedNetwork as SupportedAptosNetwork } from "@rarible/aptos-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { Blockchain, OrderId } from "@rarible/api-client"
import { Action } from "@rarible/action"
import { extractId } from "@rarible/sdk-common"
import { BlockchainAptosTransaction } from "@rarible/sdk-transaction"
import { toBn } from "@rarible/utils"
import { APT_DIVIDER } from "@rarible/aptos-sdk"
import type { IApisSdk } from "../../domain"
import type { PrepareFillResponse, FillRequest, PrepareFillRequest } from "../../types/order/fill/domain"
import type { BuySimplifiedRequest } from "../../types/order/fill/simplified"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import type * as OrderCommon from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getNftContractAddress, getOrderId } from "../../common/utils"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import { convertAptosToUnionOrderId, getFeeObject, getSupportedCurrencies } from "./common"

export class AptosListing {
  constructor(
    private readonly sdk: AptosSdk,
    private readonly network: SupportedAptosNetwork,
    private readonly apis: IApisSdk,
  ) {
    this.sell = this.sell.bind(this)
    this.sellBasic = this.sellBasic.bind(this)
    this.buy = this.buy.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
  }

  async sell(): Promise<PrepareSellInternalResponse> {
    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderCommon.OrderInternalRequest) => {
        const aptosItemId = extractId(request.itemId)
        const aptosItem = await this.apis.item.getItemById({ itemId: `${Blockchain.APTOS}:${aptosItemId}` })

        if (request.originFees && request.originFees.length > 1) {
          throw new Error("Origin fees should consist only 1 item")
        }
        const assetType = getCurrencyAssetType(request.currency)
        if (assetType["@type"] !== "CURRENCY_NATIVE") {
          throw new Error("Only native token currency is available for sell operation")
        }
        const startTime = Math.floor(Date.now() / 1000)

        let objectAddress
        if (aptosItem?.extra?.propertyVersionV1 !== undefined) {
          objectAddress = await this.sdk.order.sellV1(
            await getFeeObject({
              originFees: request.originFees || [],
              defaultFeeAddress: this.sdk.order.getFeeScheduleAddress(),
              createFeeSchedule: this.sdk.order.createFeeSchedule,
            }),
            aptosItem.creators[0].account.replace("APTOS:", ""), // todo Irina prettify
            aptosItem.itemCollection?.name ?? "",
            "Crypto Cats N2", // todo Irina get from item
            aptosItem.extra["propertyVersionV1"],
            startTime,
            toBn(request.price.toString()).multipliedBy(APT_DIVIDER).toFixed(),
          )
        } else {
          objectAddress = await this.sdk.order.sell(
            aptosItemId,
            await getFeeObject({
              originFees: request.originFees || [],
              defaultFeeAddress: this.sdk.order.getFeeScheduleAddress(),
              createFeeSchedule: this.sdk.order.createFeeSchedule,
            }),
            startTime,
            toBn(request.price.toString()).multipliedBy(APT_DIVIDER).toFixed(),
          )
        }
        return convertAptosToUnionOrderId(objectAddress)
      },
    })

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.MULTIPLE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: getSupportedCurrencies(),
      baseFee: 0,
      supportsExpirationDate: true,
      shouldTransferNft: true,
      submit,
    }
  }

  async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
    const prepare = await this.sell()
    return prepare.submit(request)
  }

  async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    const order = await this.apis.order.getValidatedOrderById({
      id: getOrderId(request),
    })

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        if (buyRequest.originFees?.length) {
          throw new Error("Origin fees is not supported in buy operation. You can set it during sell")
        }
        const aptosOrderId = extractId(order.id)
        const tx = await this.sdk.order.buy(aptosOrderId)
        return new BlockchainAptosTransaction(tx, this.network, this.sdk)
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
        nftCollection: getNftContractAddress(order.make.type),
      },
    }
  }

  async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.buy(request)
    return response.submit(request)
  }
}
