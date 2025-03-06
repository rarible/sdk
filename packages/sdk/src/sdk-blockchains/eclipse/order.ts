import type { Maybe } from "@rarible/types"
import { toBigNumber, toItemId, toOrderId, toUnionContractAddress } from "@rarible/types"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import type { Collection, Order, OrderId } from "@rarible/api-client"
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

function getMintId(order: Order): [PublicKey, boolean] {
  let isCollectionOffer = false
  let mintId: PublicKey

  if (order.make.type["@type"] === "NFT") {
    mintId = extractPublicKey(order.make.type.itemId)
  } else if (order.take.type["@type"] === "NFT") {
    mintId = extractPublicKey(order.take.type.itemId)
  } else if (order.make.type["@type"] === "NFT_OF_COLLECTION") {
    mintId = extractPublicKey(order.make.type.collectionId)
    isCollectionOffer = true
  } else if (order.take.type["@type"] === "NFT_OF_COLLECTION") {
    mintId = extractPublicKey(order.take.type.collectionId)
    isCollectionOffer = true
  } else {
    throw new Error("Unsupported type")
  }

  return [mintId, isCollectionOffer]
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
    this.buy = this.buy.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
    this.fill = this.fill.bind(this)
    this.bid = this.bid.bind(this)
    this.bidBasic = this.bidBasic.bind(this)
    this.cancelBasic = this.cancelBasic.bind(this)
    this.acceptBid = this.acceptBid.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
  }

  async sell(): Promise<PrepareSellInternalResponse> {
    if (!this.wallet) {
      throw new Error("Eclipse wallet not provided")
    }

    const marketplace = await this.sdk.order.getMarketPlace({ marketIdentifier: getMarketplace(this.config) })

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderCommon.OrderInternalRequest) => {
        return this.sellCommon(request, getMarketplace(this.config))
      },
    })

    const baseFee = marketplace.feeBps2
      ? marketplace.feeBps2.toNumber() + marketplace.feeBps.toNumber()
      : marketplace.feeBps.toNumber()

    return {
      originFeeSupport: OriginFeeSupport.NONE,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: supportedCurrencies(),
      baseFee,
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

    let nftOrCollection: Item | Collection | undefined
    let collectionId
    if ("itemId" in prepare) {
      nftOrCollection = await this.apis.item.getItemById({ itemId: prepare.itemId })
      collectionId = nftOrCollection.collection
    } else if ("collectionId" in prepare) {
      nftOrCollection = await this.apis.collection.getCollectionById({ collection: prepare.collectionId })
      collectionId = nftOrCollection.id
    }

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (request: OrderRequest) => {
        const amount = request.amount !== undefined ? request.amount : 1

        const result = await (
          await this.sdk.order.bid({
            marketIdentifier: getMarketplace(this.config),
            signer: this.wallet!.provider,
            nftMint: nftOrCollection ? extractPublicKey(nftOrCollection.id) : undefined,
            paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
            price: new BigNumber(request.price).multipliedBy(amount),
            tokensAmount: amount,
          })
        ).submit("processed")

        return toOrderId(`ECLIPSE:${result.orderId}`)
      },
    })

    return {
      multiple: nftOrCollection && "supply" in nftOrCollection ? parseFloat(nftOrCollection.supply) > 1 : false,
      maxAmount: nftOrCollection && "supply" in nftOrCollection ? toBigNumber(nftOrCollection?.supply) : toBigNumber(1),
      originFeeSupport: OriginFeeSupport.NONE,
      payoutsSupport: PayoutsSupport.NONE,
      maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
      supportedCurrencies: getCurrencies(),
      baseFee: 0,
      getConvertableValue: _ => Promise.resolve(undefined),
      supportsExpirationDate: false,
      shouldTransferFunds: false,
      submit,
      nftData: {
        nftCollection: collectionId ? toUnionContractAddress(collectionId) : undefined,
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

  async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    return this.fill(request, false)
  }

  async acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    return this.fill(request, true)
  }

  async fill(request: PrepareFillRequest, shouldPayBaseFee: boolean): Promise<PrepareFillResponse> {
    if (!this.wallet) {
      throw new Error("Solana wallet not provided")
    }

    const order = await getPreparedOrder(request, this.apis)
    const [nftMint, isCollectionOffer] = getMintId(order)

    const orderAddress = new PublicKey(extractId(order.id))

    if (order.status !== OrderStatus.ACTIVE) {
      throw new Error("Order is not active")
    }

    let itemsCount = 1
    if (!isCollectionOffer) {
      const item = await this.apis.item.getItemById({ itemId: toItemId(`ECLIPSE:${nftMint.toString()}`) })
      itemsCount = parseFloat(item.supply.toString())
    }

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        let nftMintAddress = nftMint
        if (isCollectionOffer) {
          if (
            !buyRequest.itemId ||
            (Array.isArray(buyRequest.itemId) && (buyRequest.itemId.length === 0 || buyRequest.itemId.length > 1))
          ) {
            throw new Error("Fill request should contain exactly one itemId for accepting collection bid")
          }

          nftMintAddress = extractPublicKey(Array.isArray(buyRequest.itemId) ? buyRequest.itemId[0] : buyRequest.itemId)
        }

        const prepare1 = await this.sdk.order.executeOrder({
          signer: this.wallet!.provider,
          orderAddress,
          nftMint: nftMintAddress,
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

    let baseFee = 0
    if (shouldPayBaseFee) {
      const marketplace = await this.sdk.order.getMarketPlace({ marketIdentifier: getMarketplace(this.config) })
      baseFee = marketplace.feeBps2
        ? marketplace.feeBps2.toNumber() + marketplace.feeBps.toNumber()
        : marketplace.feeBps.toNumber()
    }

    return {
      multiple: itemsCount > 1,
      maxAmount: order.makeStock,
      baseFee,
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

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.acceptBid(request)
    return response.submit(request)
  }
}
