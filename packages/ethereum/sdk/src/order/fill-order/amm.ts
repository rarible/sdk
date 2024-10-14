import type { Maybe } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import type { SendFunction } from "../../common/send-transaction"
import { getRequiredWallet } from "../../common/get-required-wallet"
import type { SimpleOrder } from "../types"
import type { EthereumNetwork, IRaribleEthereumSdkConfig } from "../../types"
import { createExchangeWrapperContract } from "../contracts/exchange-wrapper"
import type { RaribleEthereumApis } from "../../common/apis"
import type { GetConfigByChainId } from "../../config"
import type { AmmOrderFillRequest, OrderFillSendData, PreparedOrderRequestDataForExchangeWrapper } from "./types"
import { ExchangeWrapperOrderType } from "./types"
import { SudoswapFill } from "./amm/sudoswap-fill"
import { getMarketData } from "./common/get-market-data"

export class AmmOrderHandler {
  constructor(
    private readonly ethereum: Maybe<Ethereum>,
    private readonly send: SendFunction,
    private readonly getConfig: GetConfigByChainId,
    private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
    private readonly getApis: () => Promise<RaribleEthereumApis>,
    private readonly env: EthereumNetwork,
    private readonly sdkConfig?: IRaribleEthereumSdkConfig,
    private readonly options: { directBuy: boolean } = { directBuy: false },
  ) {}

  async getTransactionData(request: AmmOrderFillRequest): Promise<OrderFillSendData> {
    const ethereum = getRequiredWallet(this.ethereum)
    const fillData = await this.getTransactionDataDirectBuy(request)

    const config = await this.getConfig()

    if (this.options.directBuy) {
      // direct buy with sudoswap contract
      if (request.originFees?.length) {
        throw new Error("Origin fees not supported for sudoswap direct buy")
      }

      return {
        functionCall: fillData.functionCall,
        options: fillData.options,
      }
    } else {
      // buy with rarible wrapper
      const wrapperContract = createExchangeWrapperContract(ethereum, config.exchange.wrapper)

      const apis = await this.getApis()

      const {
        data,
        options,
        originFees: { feeAddresses },
      } = await getMarketData(this.ethereum, apis, {
        marketId: ExchangeWrapperOrderType.AAM,
        request,
        fillData: {
          data: await fillData.functionCall.getData(),
          options: fillData.options,
        },
      })
      // const {data, options, originFees: {feeAddresses}} = await this.getMarketData(request, fillData)
      const functionCall = wrapperContract.functionCall("singlePurchase", data, feeAddresses[0], feeAddresses[1])

      return {
        functionCall: functionCall,
        options,
      }
    }
  }

  private async getTransactionDataDirectBuy(request: AmmOrderFillRequest): Promise<OrderFillSendData> {
    const ethereum = getRequiredWallet(this.ethereum)
    const config = await this.getConfig()

    let fillData: OrderFillSendData
    switch (request.order.data.dataType) {
      case "SUDOSWAP_AMM_DATA_V1":
        fillData = await SudoswapFill.getDirectFillData(ethereum, request, config)
        break
      default:
        throw new Error("Unsupported order data type " + request.order.data.dataType)
    }

    return {
      functionCall: fillData.functionCall,
      options: fillData.options,
    }
  }

  async getTransactionDataForExchangeWrapper(
    request: AmmOrderFillRequest,
    feeValue: BigNumber,
  ): Promise<PreparedOrderRequestDataForExchangeWrapper> {
    if (request.order.take.assetType.assetClass !== "ETH") {
      throw new Error("Unsupported asset type for take asset " + request.order.take.assetType.assetClass)
    }

    const apis = await this.getApis()

    const fillData = await this.getTransactionDataDirectBuy(request)
    // const {data, options} = await this.getMarketData(request, fillData, feeValue)
    const { data, options } = await getMarketData(this.ethereum, apis, {
      marketId: ExchangeWrapperOrderType.AAM,
      request,
      fillData: {
        data: await fillData.functionCall.getData(),
        options: fillData.options,
      },
      feeValue,
    })

    return {
      data,
      options,
    }
  }

  getFillOrderBaseFee() {
    return this.getBaseOrderFeeConfig("AMM")
  }

  getOrderFee(): number {
    return 0
  }
}
