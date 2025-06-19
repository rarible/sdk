import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types"
import { toEVMAddress, toWord } from "@rarible/types"
import type { OrderId } from "@rarible/api-client"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import { extractBlockchain } from "@rarible/sdk-common"
import type * as OrderCommon from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalRequest, PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest, SellUpdateSimplifiedRequest } from "../../types/order/sell/simplified"
import { convertDateToTimestamp, getDefaultExpirationDateTimestamp } from "../../common/get-expiration-date"
import { checkPayouts } from "../../common/check-payouts"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import type { IApisSdk } from "../../domain"
import * as common from "./common"
import {
  checkWalletBlockchain,
  getEthereumItemId,
  getEthOrder,
  getOriginFeeSupport,
  getPayoutsSupport,
  getWalletBlockchain,
  isEVMBlockchain,
  isRaribleV1Data,
  isRaribleV2Data,
} from "./common"

export class EthereumSell {
  constructor(
    private sdk: RaribleSdk,
    private wallet: Maybe<EthereumWallet>,
    private apis: IApisSdk,
  ) {
    this.sell = this.sell.bind(this)
    this.update = this.update.bind(this)
    this.sellBasic = this.sellBasic.bind(this)
    this.sellUpdateBasic = this.sellUpdateBasic.bind(this)
  }

  async sell(req: PrepareSellInternalRequest): Promise<PrepareSellInternalResponse> {
    return this.sellDataV2(req)
  }

  async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
    const blockchain = extractBlockchain(request.itemId)
    const totalFees = (request.originFees || []).reduce((sum, it) => sum + it.value, 0)
    const prepare = await this.sell({ blockchain, withOriginFees: totalFees > 0 })
    return prepare.submit(request)
  }

  async sellUpdateBasic(request: SellUpdateSimplifiedRequest): Promise<OrderId> {
    const prepare = await this.update(request)
    return prepare.submit(request)
  }

  async getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
    return {
      originFeeSupport: OriginFeeSupport.FULL,
      baseFee: await this.sdk.order.getBaseOrderFee(),
    }
  }

  private async sellDataV2(req: PrepareSellInternalRequest): Promise<PrepareSellInternalResponse> {
    const defaultBaseFee = await this.sdk.order.getBaseOrderFee()
    const shouldUseV3 = defaultBaseFee > 0 && req.withOriginFees !== false

    const sellAction = this.sdk.order.sell.around(
      async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
        await checkWalletBlockchain(this.wallet, extractBlockchain(sellFormRequest.itemId))
        checkPayouts(sellFormRequest.payouts)
        const { tokenId, contract } = getEthereumItemId(sellFormRequest.itemId)
        const expirationDate = sellFormRequest.expirationDate
          ? convertDateToTimestamp(sellFormRequest.expirationDate)
          : getDefaultExpirationDateTimestamp()
        const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)
        return {
          type: shouldUseV3 ? "DATA_V3" : "DATA_V2",
          makeAssetType: {
            tokenId: tokenId,
            contract: toEVMAddress(contract),
          },
          amount: sellFormRequest.amount ?? 1,
          takeAssetType: common.getEthTakeAssetType(currencyAssetType),
          priceDecimal: sellFormRequest.price,
          payouts: common.toEthereumParts(sellFormRequest.payouts),
          originFees: common.toEthereumParts(sellFormRequest.originFees),
          end: expirationDate,
        }
      },
      async order => {
        //todo replace with returned chainId/blockchain
        const blockchain = await getWalletBlockchain(this.wallet)

        if (this.sdk.stabilityProtocol) {
          setTimeout(async () => {
            const address = await this.wallet?.ethereum.getFrom()
            this.sdk.stabilityProtocol?.sendMessage({
              wallet: address!,
              orderId: order.hash,
              blockchain: blockchain,
              action: "SELL",
              timestamp: Date.now(),
            })
          })
        }
        return common.convertEthereumOrderHash(order.hash, blockchain)
      },
    )

    return {
      originFeeSupport: OriginFeeSupport.FULL,
      payoutsSupport: PayoutsSupport.MULTIPLE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: common.getSupportedCurrencies(),
      baseFee: shouldUseV3 ? defaultBaseFee : 0,
      supportsExpirationDate: true,
      shouldTransferNft: false,
      submit: sellAction,
    }
  }

  async update(prepareRequest: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
    if (!prepareRequest.orderId) {
      throw new Error("OrderId has not been specified")
    }
    const [blockchain, hash] = prepareRequest.orderId.split(":")
    if (!isEVMBlockchain(blockchain)) {
      throw new Error("Not an ethereum order")
    }

    const order = await this.apis.order.getValidatedOrderById({
      id: prepareRequest.orderId,
    })
    if (!isRaribleV1Data(order.data) && !isRaribleV2Data(order.data)) {
      throw new Error(`You can't update non-Rarible orders. Unable to update sell ${JSON.stringify(order)}`)
    }

    const sellUpdateAction = this.sdk.order.sellUpdate.around(
      async (request: OrderCommon.OrderUpdateRequest) => {
        await checkWalletBlockchain(this.wallet, blockchain)
        return {
          orderHash: toWord(hash),
          priceDecimal: request.price,
        }
      },
      order => common.convertEthereumOrderHash(order.hash, blockchain),
    )

    const { ethereum } = common.assertWallet(this.wallet)
    const ethOrder = await getEthOrder(ethereum, order)

    return {
      originFeeSupport: getOriginFeeSupport(order.data),
      payoutsSupport: getPayoutsSupport(order.data),
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: common.getSupportedCurrencies(),
      baseFee: await this.sdk.order.getBaseOrderFee(ethOrder.type as "RARIBLE_V1" | "RARIBLE_V2"),
      submit: sellUpdateAction,
      orderData: {
        nftCollection: "contract" in order.make.type ? order.make.type.contract : undefined,
      },
    }
  }
}
