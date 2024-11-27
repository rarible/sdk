import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { nonImplementedAction, notImplemented } from "@rarible/sdk-common"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import type { ISolanaSdkConfig } from "./domain"

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
  // const nftService = new SolanaNft(sdk, wallet, apis, config)
  // const balanceService = new SolanaBalance(sdk, wallet, apis, config)
  // const orderService = new SolanaOrder(sdk, wallet, apis, config)
  // const fillService = new SolanaFill(sdk, wallet, apis, config)
  // const { createCollectionBasic } = new SolanaCollection(sdk, wallet, apis, config)
  //
  // const preprocessMeta = Middlewarer.skipMiddleware(nftService.preprocessMeta)
  // const metaUploader = new MetaUploader(Blockchain.SOLANA, preprocessMeta)

  return {
    nft: {
      mint: new MethodWithPrepare(nonImplementedAction, nonImplementedAction) as IMint,
      burn: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      transfer: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      generateTokenId: nonImplementedAction,
      createCollection: nonImplementedAction,
      preprocessMeta: notImplemented,
      uploadMeta: nonImplementedAction,
    },
    order: {
      fill: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      buy: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      batchBuy: new MethodWithPrepare(notImplemented, nonImplementedAction),
      acceptBid: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      sell: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      sellUpdate: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      bid: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      bidUpdate: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      cancel: nonImplementedAction,
    },
    balances: {
      getBalance: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      convert: nonImplementedAction,
      transfer: notImplemented,
      getBiddingBalance: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      depositBiddingBalance: nonImplementedAction,
      withdrawBiddingBalance: nonImplementedAction,
    },
    restriction: {
      canTransfer: nonImplementedAction,
      getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
        return Promise.resolve({ baseFee: 0, originFeeSupport: OriginFeeSupport.NONE })
      },
    },
  }
}
