import type { Connection } from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"
import { BigNumber } from "@rarible/utils"
import type { SolanaSigner } from "@rarible/solana-common"
import type { DebugLogger } from "../../logger/debug-logger"
import { PreparedTransaction } from "../prepared-transaction"
import type { WnsAccountParams } from "../utils"
import { fetchMarketByAddress, getMarketPda } from "../utils"
import { sell } from "./sell"
import { cancelSell } from "./cancel-sell"
import { executeOrder } from "./execute-order"
import { initializeMarket } from "./initialize-market"
import { bid } from "./bid"

export interface ISellRequest {
  signer: SolanaSigner
  nftMint: PublicKey
  paymentMint: PublicKey
  marketIdentifier: PublicKey
  price: BigNumber
  tokensAmount: number
  extraAccountParams?: WnsAccountParams
}

export interface IBidRequest {
  signer: SolanaSigner
  nftMint?: PublicKey
  paymentMint: PublicKey
  marketIdentifier: PublicKey
  price: BigNumber
  tokensAmount: number
}

export interface IExecuteOrderRequest {
  signer: SolanaSigner
  orderAddress: PublicKey
  amountToFill: number
  nftMint: PublicKey
  extraAccountParams?: WnsAccountParams
}

export interface ICancelRequest {
  signer: SolanaSigner
  orderAddress: PublicKey
  extraAccountParams?: WnsAccountParams
}

export interface IInitializeMarketRequest {
  signer: SolanaSigner
  marketIdentifier: PublicKey
  feeRecipient: PublicKey
  initializer: PublicKey
  versionNumber: number
  feeBps: BigNumber
}

export interface IGetMarketplaceRequest {
  marketIdentifier: PublicKey
}

export interface Marketplace {
  marketIdentifier: PublicKey
  feeRecipient: PublicKey
  feeBps: BigNumber
  version: number
  initializer: PublicKey
}

export interface IEclipseOrderSdk {
  sell(request: ISellRequest): Promise<PreparedTransaction>

  bid(request: IBidRequest): Promise<PreparedTransaction>

  cancel(request: ICancelRequest): Promise<PreparedTransaction>

  executeOrder(request: IExecuteOrderRequest): Promise<PreparedTransaction>

  initializeMarket(request: IInitializeMarketRequest): Promise<PreparedTransaction>

  getMarketPlace(request: IGetMarketplaceRequest): Promise<Marketplace>
}

export class EclipseOrderSdk implements IEclipseOrderSdk {
  constructor(
    private readonly connection: Connection,
    private readonly logger: DebugLogger,
  ) {}

  async initializeMarket(request: IInitializeMarketRequest): Promise<PreparedTransaction> {
    const instructions = await initializeMarket({
      connection: this.connection,
      signer: request.signer,
      marketIdentifier: request.marketIdentifier,
      feeRecipient: request.feeRecipient,
      feeBps: request.feeBps,
    })

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log(
        "Initialize market",
        request.marketIdentifier,
        "with feeRecipient",
        request.feeRecipient.toString(),
        "and feeBps",
        request.feeBps.toString,
      )
    })
  }

  async sell(request: ISellRequest): Promise<PreparedTransaction> {
    const instructions = await sell({
      connection: this.connection,
      marketIdentifier: request.marketIdentifier,
      signer: request.signer,
      nftMint: request.nftMint,
      paymentMint: request.paymentMint,
      price: request.price,
      tokensAmount: request.tokensAmount,
      extraAccountParams: request.extraAccountParams,
    })

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log("Set", request.tokensAmount, request.nftMint.toString(), "for sale for", request.price)
    })
  }

  async bid(request: IBidRequest): Promise<PreparedTransaction> {
    const instructions = await bid({
      connection: this.connection,
      marketIdentifier: request.marketIdentifier,
      signer: request.signer,
      nftMint: request.nftMint,
      paymentMint: request.paymentMint,
      price: request.price,
      tokensAmount: request.tokensAmount,
    })

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log(
        "Bid token",
        request.nftMint?.toString(),
        "with price",
        request.price,
        "and count",
        request.tokensAmount,
        "and currency",
        request.paymentMint.toString(),
      )
    })
  }

  async cancel(request: ICancelRequest): Promise<PreparedTransaction> {
    const instructions = await cancelSell({
      connection: this.connection,
      signer: request.signer,
      orderAddress: request.orderAddress,
      extraAccountParams: request.extraAccountParams,
    })

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log("Cancelled order of", request.orderAddress.toString())
    })
  }

  async executeOrder(request: IExecuteOrderRequest): Promise<PreparedTransaction> {
    const instructions = await executeOrder(
      {
        connection: this.connection,
        signer: request.signer,
        nftMint: request.nftMint,
        amountToFill: request.amountToFill,
        orderAddress: request.orderAddress,
        extraAccountParams: request.extraAccountParams,
      },
      this.logger,
    )

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log(
        "Execute order",
        request.orderAddress.toString(),
        "for mint",
        request.nftMint.toString(),
        "number of tokens",
        request.amountToFill,
      )
    })
  }

  async getMarketPlace(request: IGetMarketplaceRequest): Promise<Marketplace> {
    const marketAddress = getMarketPda(request.marketIdentifier.toString())
    const market = await fetchMarketByAddress(this.connection, marketAddress.toString())
    if (!market) {
      throw new Error(`Market not found ${marketAddress.toString()}`)
    }

    this.logger.log("Get marketplace", request.marketIdentifier.toString())

    return {
      marketIdentifier: request.marketIdentifier,
      feeRecipient: market.feeRecipient,
      feeBps: new BigNumber(market.feeBps.toString()),
      initializer: market.initializer,
      version: market.version,
    }
  }
}
