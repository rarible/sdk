import type { Maybe } from "@rarible/types"
import { toBigNumber, toItemId, toOrderId, toUnionContractAddress } from "@rarible/types"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import type { Order, OrderId } from "@rarible/api-client"
import { Blockchain, OrderStatus } from "@rarible/api-client"
import { PublicKey } from "@solana/web3.js"
import type { EclipseSdk } from "@rarible/eclipse-sdk"
import { ECLIPSE_NATIVE_CURRENCY_ADDRESS, PreparedTransaction } from "@rarible/eclipse-sdk"
import { BlockchainSolanaTransaction, type IBlockchainTransaction } from "@rarible/sdk-transaction"
import { extractId } from "@rarible/sdk-common"
import BigNumber from "bignumber.js"
import type { Item } from "@rarible/api-client/build/models"
import type * as OrderCommon from "../../types/order/common"
import type { OrderRequest } from "../../types/order/common"
import {
  type FillRequest,
  MaxFeesBasePointSupport,
  OriginFeeSupport,
  PayoutsSupport,
  type PrepareFillRequest,
  type PrepareFillResponse,
} from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import { getCurrencyId } from "../../common/get-currency-asset-type"
import type { CurrencyType } from "../../common/domain"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import { getPreparedOrder } from "../solana/common/order"
import type { AcceptBidSimplifiedRequest, BuySimplifiedRequest } from "../../types/order/fill/simplified"
import { getNftContractAddress, isNativeToken } from "../../common/utils"
import type { PrepareBidRequest, PrepareBidResponse } from "../../types/order/bid/domain"
import { getCurrencies } from "../solana/common/currencies"
import type { BidSimplifiedRequest } from "../../types/order/bid/simplified"
import { extractPublicKey } from "./common/address-converters"
import type { IEclipseSdkConfig } from "./domain"

function supportedCurrencies(): CurrencyType[] {
  return [{ blockchain: Blockchain.ECLIPSE, type: "NATIVE" }]
}

function getMintId(order: Order): PublicKey {
  if (order.make.type["@type"] === "NFT") {
    return extractPublicKey(order.make.type.itemId)
  } else if (order.take.type["@type"] === "NFT") {
    return extractPublicKey(order.take.type.itemId)
  }
  throw new Error("Unsupported type")
}

function getMarketplace(config: IEclipseSdkConfig) {
  if (config.eclipseMarketplaces.length === 0) {
    throw new Error("Should have at least one marketplace in config")
  }
  if (config.eclipseMarketplaces.length > 1) {
    throw new Error("Should have only one marketplace in config")
  }

  return config.eclipseMarketplaces[0]
}

export class EclipseOrder {
  constructor(
    readonly sdk: EclipseSdk,
    readonly wallet: Maybe<SolanaWallet>,
    private readonly apis: IApisSdk,
    private readonly config: IEclipseSdkConfig,
  ) {
    this.sell = this.sell.bind(this)
    this.sellBasic = this.sellBasic.bind(this)
    this.cancelBasic = this.cancelBasic.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
    this.fill = this.fill.bind(this)
    this.bid = this.bid.bind(this)
    this.bidBasic = this.bidBasic.bind(this)
    this.cancelBasic = this.cancelBasic.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
  }

  async sell(): Promise<PrepareSellInternalResponse> {
    if (!this.wallet) {
      throw new Error("Eclipse wallet not provided")
    }

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderCommon.OrderInternalRequest) => {
        return this.sellCommon(request, getMarketplace(this.config))
      },
    })

    return {
      originFeeSupport: OriginFeeSupport.NONE,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: supportedCurrencies(),
      baseFee: 0,
      supportsExpirationDate: false,
      shouldTransferNft: false,
      submit: submit,
    }
  }

  async sellCommon(request: OrderCommon.OrderInternalRequest, marketIdentifier: PublicKey) {
    const nftMint = extractPublicKey(request.itemId)
    const amount = request.amount !== undefined ? request.amount : 1
    const currency = extractId(getCurrencyId(request.currency))

    const result = await (
      await this.sdk.order.sell({
        marketIdentifier,
        signer: this.wallet!.provider,
        nftMint,
        price: new BigNumber(request.price),
        tokensAmount: amount,
        paymentMint: new PublicKey(currency),
      })
    ).submit("processed")

    return toOrderId(`ECLIPSE:${result.orderId}`)
  }

  async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
    const response = await this.sell()
    return response.submit(request)
  }

  async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
    if (!this.wallet) {
      throw new Error("Eclipse wallet not provided")
    }

    let item: Item | undefined
    if ("itemId" in prepare) {
      item = await this.apis.item.getItemById({ itemId: prepare.itemId })
    }

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderRequest) => {
        const amount = request.amount !== undefined ? request.amount : 1

        const result = await (
          await this.sdk.order.bid({
            marketIdentifier: getMarketplace(this.config),
            signer: this.wallet!.provider,
            nftMint: item ? extractPublicKey(item.id) : undefined,
            paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
            price: new BigNumber(request.price).multipliedBy(amount),
            tokensAmount: amount,
          })
        ).submit("processed")

        return toOrderId(`ECLIPSE:${result.orderId}`)
      },
    })

    const marketplace = await this.sdk.order.getMarketPlace({ marketIdentifier: getMarketplace(this.config) })

    return {
      multiple: item ? parseFloat(item.supply) > 1 : false,
      maxAmount: item ? toBigNumber(item.supply) : toBigNumber(1),
      originFeeSupport: OriginFeeSupport.NONE,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: getCurrencies(),
      baseFee: marketplace.feeBps.toNumber(),
      getConvertableValue: _ => Promise.resolve(undefined),
      supportsExpirationDate: false,
      shouldTransferFunds: false,
      submit,
      nftData: {
        nftCollection: item?.collection ? toUnionContractAddress(item.collection) : undefined,
      },
    }
  }

  async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
    const response = await this.bid(request)
    return response.submit(request)
  }

  async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
    const order = await this.apis.order.getValidatedOrderById({
      id: request.orderId,
    })

    const isCancelBid = isNativeToken(order.make.type)

    const cancel = Action.create({
      id: "send-tx" as const,
      run: async (request: CancelOrderRequest) => {
        const order = await this.apis.order.getValidatedOrderById({
          id: request.orderId,
        })
        const orderAddress = new PublicKey(extractId(order.id))

        if (isCancelBid) {
          const res = await (
            await this.sdk.order.cancelBid({
              signer: this.wallet!.provider,
              orderAddress,
            })
          ).submit("processed")

          return new BlockchainSolanaTransaction(res, this.sdk, Blockchain.ECLIPSE)
        } else {
          const res = await (
            await this.sdk.order.cancelSell({
              signer: this.wallet!.provider,
              orderAddress,
            })
          ).submit("processed")

          return new BlockchainSolanaTransaction(res, this.sdk, Blockchain.ECLIPSE)
        }
      },
    })

    return cancel(request)
  }

  async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    if (!this.wallet) {
      throw new Error("Solana wallet not provided")
    }

    const order = await getPreparedOrder(request, this.apis)
    const nftMint = getMintId(order)

    const orderAddress = new PublicKey(extractId(order.id))

    if (order.status !== OrderStatus.ACTIVE) {
      throw new Error("Order is not active")
    }

    const item = await this.apis.item.getItemById({ itemId: toItemId(`ECLIPSE:${nftMint.toString()}`) })

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        const prepare1 = await this.sdk.order.executeOrder({
          signer: this.wallet!.provider,
          orderAddress,
          nftMint,
          amountToFill: buyRequest.amount,
        })

        const data = {
          instructions: prepare1.data.instructions,
          signers: prepare1.data.signers,
        }

        // revoke empty delegated token account
        const tokenAccount = await this.sdk.account.getTokenAccountForMint({
          mint: nftMint,
          owner: this.wallet!.provider.publicKey,
        })
        if (tokenAccount) {
          const accountInfo = await this.sdk.account.getAccountInfo({ tokenAccount })
          if (accountInfo.delegate && accountInfo.amount.toString() === "0") {
            const prepare2 = this.sdk.account.revokeDelegate({
              signer: this.wallet!.provider,
              tokenAccount,
            })

            data.instructions.push(...prepare2.data.instructions)
            data.signers.push(...prepare2.data.signers)
          }
        }

        return await new PreparedTransaction(this.sdk.connection, data, this.wallet!.provider).submit("processed")
      },
    }).after(tx => new BlockchainSolanaTransaction(tx, this.sdk, Blockchain.ECLIPSE))

    const marketplace = await this.sdk.order.getMarketPlace({ marketIdentifier: getMarketplace(this.config) })

    return {
      multiple: parseFloat(item.supply.toString()) > 1,
      maxAmount: order.makeStock,
      baseFee: marketplace.feeBps.toNumber(),
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
    const response = await this.fill(request)
    return response.submit(request)
  }

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.fill(request)
    return response.submit(request)
  }
}
