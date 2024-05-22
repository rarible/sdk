import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import type { ISolanaSdkConfig } from "./domain"
import { SolanaNft } from "./nft"
import { SolanaFill } from "./fill"
import { SolanaOrder } from "./order"
import { SolanaBalance } from "./balance"
import { SolanaCollection } from "./collection"

export function createSolanaSdk(
  wallet: Maybe<SolanaWallet>,
  apis: IApisSdk,
  cluster: Cluster,
  config: ISolanaSdkConfig | undefined,
): IRaribleInternalSdk {
  const sdk = SolanaSdk.create({
    connection: {
      cluster,
      endpoint: config?.endpoint,
      commitmentOrConfig: "confirmed",
    },
    debug: false,
  })
  const nftService = new SolanaNft(sdk, wallet, apis, config)
  const balanceService = new SolanaBalance(sdk, wallet, apis, config)
  const orderService = new SolanaOrder(sdk, wallet, apis, config)
  const fillService = new SolanaFill(sdk, wallet, apis, config)
  const { createCollectionBasic } = new SolanaCollection(sdk, wallet, apis, config)

  const preprocessMeta = Middlewarer.skipMiddleware(nftService.preprocessMeta)
  const metaUploader = new MetaUploader(Blockchain.SOLANA, preprocessMeta)

  return {
    nft: {
      mint: new MethodWithPrepare(nftService.mintBasic, nftService.mint) as IMint,
      burn: new MethodWithPrepare(nftService.burnBasic, nftService.burn),
      transfer: new MethodWithPrepare(nftService.transferBasic, nftService.transfer),
      generateTokenId: nonImplementedAction,
      createCollection: createCollectionBasic,
      preprocessMeta,
      uploadMeta: metaUploader.uploadMeta,
    },
    order: {
      fill: { prepare: fillService.fill },
      buy: new MethodWithPrepare(fillService.buyBasic, fillService.fill),
      batchBuy: new MethodWithPrepare(notImplemented, nonImplementedAction),
      acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.fill),
      sell: new MethodWithPrepare(orderService.sellBasic, orderService.sell),
      sellUpdate: new MethodWithPrepare(orderService.sellUpdateBasic, orderService.sellUpdate),
      bid: new MethodWithPrepare(orderService.bidBasic, orderService.bid),
      bidUpdate: new MethodWithPrepare(orderService.bidUpdateBasic, orderService.bidUpdate),
      cancel: orderService.cancelBasic,
    },
    balances: {
      getBalance: balanceService.getBalance,
      convert: nonImplementedAction,
      transfer: notImplemented,
      getBiddingBalance: balanceService.getBiddingBalance,
      depositBiddingBalance: balanceService.depositBiddingBalance,
      withdrawBiddingBalance: balanceService.withdrawBiddingBalance,
    },
    restriction: {
      canTransfer: nonImplementedAction,
      getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
        return orderService.getFutureOrderFees()
      },
    },
  }
}
