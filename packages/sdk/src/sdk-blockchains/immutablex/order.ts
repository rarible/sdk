import type { RaribleImxSdk } from "@rarible/immutable-sdk/src/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainImmutableXTransaction } from "@rarible/sdk-transaction"
import { toEVMAddress, toBigNumber, toOrderId } from "@rarible/types"
import type { OrderId } from "@rarible/api-client"
import { Blockchain, OrderStatus } from "@rarible/api-client"
import { Action } from "@rarible/action"
import type { Erc721AssetRequest } from "@rarible/immutable-sdk"
import type { IApisSdk } from "../../domain"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type * as OrderCommon from "../../types/order/common"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { AcceptBidSimplifiedRequest, BuySimplifiedRequest } from "../../types/order/fill/simplified"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import { checkPayouts } from "../../common/check-payouts"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { getOrderNftContractAddress } from "../../common/utils"
import { calcBuyerBaseFee, getPreparedOrder, getTakeAssetType, unionPartsToParts } from "./common/utils"
import { getCurrencies } from "./common/currencies"

export class ImxOrderService {
  constructor(
    private sdk: RaribleImxSdk,
    private apis: IApisSdk,
  ) {
    this.sell = this.sell.bind(this)
    this.buy = this.buy.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
    this.sellBasic = this.sellBasic.bind(this)
    this.cancelBasic = this.cancelBasic.bind(this)
  }

  async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
    const prepare = await this.buy(request)
    return prepare.submit(request)
  }

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const prepare = await this.buy(request)
    return prepare.submit(request)
  }

  async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
    const prepare = await this.sell()
    return prepare.submit(request)
  }

  async sell(): Promise<PrepareSellInternalResponse> {
    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderCommon.OrderInternalRequest) => {
        checkPayouts(request.payouts)
        const [, contract, tokenId] = request.itemId.split(":")

        const res = await this.sdk.order.sell({
          amount: toBigNumber(request.price.toString()),
          originFees: unionPartsToParts(request.originFees),
          payouts: unionPartsToParts(request.payouts),
          makeAssetType: {
            assetClass: "ERC721",
            contract: toEVMAddress(contract),
            tokenId: toBigNumber(tokenId),
          },
          takeAssetType: getTakeAssetType(request.currency),
        })

        return toOrderId(`${Blockchain.IMMUTABLEX}:${res.orderId}`)
      },
    })

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.MULTIPLE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: getCurrencies(),
      baseFee: 200, // in reality is not taken from the seller, but it needs to display fees correctly
      supportsExpirationDate: false,
      shouldTransferNft: false,
      submit: submit,
    }
  }

  async getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
    return {
      originFeeSupport: OriginFeeSupport.FULL,
      baseFee: 200,
    }
  }

  async buy(prepare: PrepareFillRequest): Promise<PrepareFillResponse> {
    const order = await getPreparedOrder(prepare, this.apis)

    if (order.status !== OrderStatus.ACTIVE) {
      throw new Error("Order is not active")
    }

    const getERC721Asset = () => {
      if (order.make.type["@type"] !== "ERC721") {
        throw new Error("Order make type should be ERC721")
      }

      const [, address] = order.make.type.contract.split(":")

      return {
        assetClass: "ERC721",
        contract: address,
        tokenId: order.make.type.tokenId,
      } as Erc721AssetRequest
    }

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: FillRequest) => {
        checkPayouts(request.payouts)
        const [, orderId] = order.id.split(":")
        const res = await this.sdk.order.buy(
          {
            orderId: orderId,
            fee: unionPartsToParts(request.originFees),
          },
          getERC721Asset(),
        )
        console.log(res)
        return res
      },
    }).after(res => new BlockchainImmutableXTransaction(res.txId))

    return {
      multiple: false,
      maxAmount: order.makeStock,
      baseFee: calcBuyerBaseFee(order),
      supportsPartialFill: false,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.NONE,
      submit,
      orderData: {
        platform: order.platform,
        nftCollection: getOrderNftContractAddress(order),
      },
    }
  }

  async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
    const [, orderId] = request.orderId.split(":")

    await this.sdk.order.cancel({
      orderId: orderId,
    })

    return new BlockchainImmutableXTransaction(undefined)
  }
}
