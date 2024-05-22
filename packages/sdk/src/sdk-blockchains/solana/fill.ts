import { Action } from "@rarible/action"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import type { Order } from "@rarible/api-client"
import { OrderStatus } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import type { BuySimplifiedRequest } from "../../types/order/fill/simplified"
import type { AcceptBidSimplifiedRequest } from "../../types/order/fill/simplified"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { checkPayouts } from "../../common/check-payouts"
import { getNftContractAddress } from "../../common/utils"
import { extractPublicKey } from "./common/address-converters"
import { getItemId, getMintId, getOrderData, getPreparedOrder, getPrice } from "./common/order"
import { getAuctionHouseFee } from "./common/auction-house"
import type { ISolanaSdkConfig } from "./domain"

export class SolanaFill {
  constructor(
    readonly sdk: SolanaSdk,
    readonly wallet: Maybe<SolanaWallet>,
    private readonly apis: IApisSdk,
    private readonly config: ISolanaSdkConfig | undefined,
  ) {
    this.fill = this.fill.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
  }

  private static isBuyOrder(order: Order): boolean {
    return order.make.type["@type"] === "SOLANA_NFT"
  }

  async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    if (!this.wallet) {
      throw new Error("Solana wallet not provided")
    }

    const order = await getPreparedOrder(request, this.apis)
    if (order.status !== OrderStatus.ACTIVE) {
      throw new Error("Order is not active")
    }
    return SolanaFill.isBuyOrder(order) ? this.buy(order) : this.acceptBid(order)
  }

  private async buy(order: Order): Promise<PrepareFillResponse> {
    const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)
    const mint = getMintId(order)
    const price = getPrice(order)

    const item = await this.apis.item.getItemById({ itemId: getItemId(mint) })

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        checkPayouts(buyRequest.payouts)
        const transactions = []

        // make buy order
        transactions.push(
          await this.sdk.order.buy({
            auctionHouse: auctionHouse,
            signer: this.wallet!.provider,
            mint: mint,
            price: price,
            tokensAmount: buyRequest.amount,
          }),
        )

        // revoke empty delegated token account
        const tokenAccount = await this.sdk.account.getTokenAccountForMint({
          mint,
          owner: this.wallet!.provider.publicKey,
        })
        if (tokenAccount) {
          const accountInfo = await this.sdk.account.getAccountInfo({ tokenAccount, mint })
          if (accountInfo.delegate && accountInfo.amount.toString() === "0") {
            transactions.push(
              await this.sdk.account.revokeDelegate({
                signer: this.wallet!.provider,
                tokenAccount,
              }),
            )
          }
        }

        // execute sell
        transactions.push(
          await this.sdk.order.executeSell({
            auctionHouse: auctionHouse,
            signer: this.wallet!.provider,
            buyerWallet: this.wallet!.provider.publicKey,
            sellerWallet: extractPublicKey(order.maker!),
            mint: mint,
            price: price,
            tokensAmount: buyRequest.amount,
          }),
        )

        return this.sdk.unionInstructionsAndSend(this.wallet!.provider, transactions, "processed")
      },
    }).after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

    return {
      multiple: parseFloat(item.supply.toString()) > 1,
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

  private async acceptBid(order: Order): Promise<PrepareFillResponse> {
    const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)
    const mint = getMintId(order)
    const price = getPrice(order)

    const item = await this.apis.item.getItemById({ itemId: getItemId(mint) })

    const submit = Action.create({
      id: "send-tx" as const,
      run: async (buyRequest: FillRequest) => {
        checkPayouts(buyRequest.payouts)
        const sellPrepare = await this.sdk.order.sell({
          auctionHouse: auctionHouse,
          signer: this.wallet!.provider,
          mint: mint,
          price: price,
          tokensAmount: buyRequest.amount,
        })

        const executePrepare = await this.sdk.order.executeSell({
          auctionHouse: auctionHouse,
          signer: this.wallet!.provider,
          buyerWallet: extractPublicKey(order.maker!),
          sellerWallet: this.wallet!.provider.publicKey,
          mint: mint,
          price: price,
          tokensAmount: buyRequest.amount,
        })

        return this.sdk.unionInstructionsAndSend(this.wallet!.provider, [sellPrepare, executePrepare], "processed")
      },
    }).after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

    return {
      multiple: parseFloat(item.supply.toString()) > 1,
      maxAmount: order.makeStock,
      baseFee: await getAuctionHouseFee(auctionHouse, this.config?.auctionHouseMapping),
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

  async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.fill(request)
    return response.submit(request)
  }

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.fill(request)
    return response.submit(request)
  }
}
