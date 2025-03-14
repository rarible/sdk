import type { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import type { FlowEnv } from "@rarible/flow-sdk"
import type { Maybe } from "@rarible/types"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import { FLOW_ENV_CONFIG as ENV_CONFIG } from "@rarible/flow-sdk"
import { Blockchain } from "@rarible/api-client"
import { nonImplementedAction, notImplemented } from "@rarible/sdk-common"
import type { IApisSdk, IRaribleInternalSdk, IRaribleSdkConfig } from "../../domain"
import { LogsLevel } from "../../domain"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import { getErrorHandlerMiddleware, NetworkErrorCode } from "../../common/apis"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"
import { FlowCancel } from "./cancel"
import { FlowBalance } from "./balance"
import { FlowBid } from "./bid"
import { FlowSetupAccount } from "./setup-account"

export function createFlowSdk(
  wallet: Maybe<FlowWallet>,
  apis: IApisSdk,
  network: FlowEnv,
  params?: ConfigurationParameters,
  config?: IRaribleSdkConfig,
): IRaribleInternalSdk {
  const sdk = createFlowSdkInstance(
    wallet?.fcl,
    network,
    {
      ...(params || {}),
      apiKey: config?.apiKey,
      middleware: [
        ...(config?.logs !== LogsLevel.DISABLED ? [getErrorHandlerMiddleware(NetworkErrorCode.FLOW_NETWORK_ERR)] : []),
        ...(params?.middleware || []),
      ],
    },
    config?.blockchain?.FLOW?.auth || wallet?.getAuth(),
  )
  const blockchainNetwork = ENV_CONFIG[network].network
  const sellService = new FlowSell(sdk, apis)
  const mintService = new FlowMint(sdk, apis, blockchainNetwork)
  const bidService = new FlowBid(sdk)
  const burnService = new FlowBurn(sdk, blockchainNetwork)
  const transferService = new FlowTransfer(sdk, blockchainNetwork)
  const fillService = new FlowBuy(sdk, apis, blockchainNetwork)
  const cancelService = new FlowCancel(sdk, apis, blockchainNetwork)
  const balanceService = new FlowBalance(sdk, network, blockchainNetwork, wallet)

  const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
  const metaUploader = new MetaUploader(Blockchain.FLOW, preprocessMeta)
  const setupAccount = new FlowSetupAccount(sdk, blockchainNetwork)

  return {
    nft: {
      mint: new MethodWithPrepare(mintService.mintBasic, mintService.prepare) as IMint,
      burn: new MethodWithPrepare(burnService.burnBasic, burnService.burn),
      transfer: new MethodWithPrepare(transferService.transferBasic, transferService.transfer),
      generateTokenId: () => Promise.resolve(undefined),
      createCollection: notImplemented,
      preprocessMeta,
      uploadMeta: metaUploader.uploadMeta,
    },
    order: {
      fill: { prepare: fillService.buy },
      sell: new MethodWithPrepare(sellService.sellBasic, sellService.sell),
      sellUpdate: new MethodWithPrepare(sellService.sellUpdateBasic, sellService.update),
      buy: new MethodWithPrepare(fillService.buyBasic, fillService.buy),
      batchBuy: new MethodWithPrepare(notImplemented, nonImplementedAction),
      acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.acceptBid),
      bid: new MethodWithPrepare(bidService.bidBasic, bidService.bid),
      bidUpdate: new MethodWithPrepare(bidService.bidUpdateBasic, bidService.update),
      cancel: cancelService.cancel,
    },
    balances: {
      getBalance: balanceService.getBalance,
      transfer: balanceService.transfer,
      convert: notImplemented,
      getBiddingBalance: notImplemented,
      depositBiddingBalance: nonImplementedAction,
      withdrawBiddingBalance: nonImplementedAction,
    },
    restriction: {
      canTransfer(): Promise<CanTransferResult> {
        return Promise.resolve({ success: true })
      },
      getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
        return sellService.getFutureOrderFees()
      },
    },
    flow: {
      setupAccount: setupAccount.setupAccount,
      checkInitMattelCollections: setupAccount.checkInitMattelCollections,
      setupMattelCollections: setupAccount.setupMattelCollections,
      setupGamisodesCollections: setupAccount.setupGamisodesCollections,
      checkInitGamisodesCollections: setupAccount.checkInitGamisodesCollections,
    },
  }
}
