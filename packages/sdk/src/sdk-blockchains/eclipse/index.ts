import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { EclipseSdk } from "@rarible/eclipse-sdk"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { MethodWithPrepare } from "../../types/common"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import type { ISolanaSdkConfig } from "../solana/domain"
import { EclipseBalance } from "./balance"
import { EclipseNft } from "./nft"

export function createEclipseSdk(
  wallet: Maybe<SolanaWallet>,
  apis: IApisSdk,
  cluster: Cluster,
  config: ISolanaSdkConfig | undefined,
): IRaribleInternalSdk {
  const sdk = EclipseSdk.create({
    connection: {
      cluster,
      endpoint: config?.eclipseEndpoint,
      commitmentOrConfig: "confirmed",
    },
    debug: false,
  })
  const balanceService = new EclipseBalance(sdk, wallet, apis)
  const nftService = new EclipseNft(sdk, wallet, apis)

  return {
    nft: {
      mint: new MethodWithPrepare(nonImplementedAction, nonImplementedAction),
      burn: new MethodWithPrepare(nftService.burnBasic, nftService.burn),
      transfer: new MethodWithPrepare(nftService.transferBasic, nftService.transfer),
      generateTokenId: nonImplementedAction,
      createCollection: nonImplementedAction,
      preprocessMeta: notImplemented,
      uploadMeta: nonImplementedAction,
    },
    order: {
      fill: { prepare: nonImplementedAction },
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
      getBalance: balanceService.getBalance,
      convert: nonImplementedAction,
      transfer: notImplemented,
      getBiddingBalance: nonImplementedAction,
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
