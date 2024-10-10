import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { nonImplementedAction, notImplemented } from "@rarible/sdk-common"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import type { RaribleSdkConfig } from "../../config/domain"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { getMaybeTezosProvider } from "./common"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"
import { TezosBurn } from "./burn"
import { TezosTokenId } from "./token-id"
import { TezosCancel } from "./cancel"
import { TezosBalance } from "./balance"
import { TezosCreateCollection } from "./create-collection"
import { TezosCanTransfer } from "./restriction"
import { TezosBid } from "./bid"

export function createTezosSdk(
  wallet: Maybe<TezosWallet>,
  _apis: IApisSdk,
  blockchainConfig: RaribleSdkConfig,
  config?: { apiKey?: string },
): IRaribleInternalSdk {
  const network = blockchainConfig.tezosNetwork
  const maybeProvider = getMaybeTezosProvider(wallet?.provider, network, {
    ...blockchainConfig,
    apiKey: config?.apiKey,
  })
  const sellService = new TezosSell(maybeProvider, _apis)
  const mintService = new TezosMint(maybeProvider, _apis, network)
  const balanceService = new TezosBalance(maybeProvider, network)
  const fillService = new TezosFill(maybeProvider, _apis, network)
  const { createCollectionSimplified } = new TezosCreateCollection(maybeProvider, network)
  const transferService = new TezosTransfer(maybeProvider, _apis, network)
  const burnService = new TezosBurn(maybeProvider, _apis, network)
  const cancelService = new TezosCancel(maybeProvider, _apis, network)
  const bidService = new TezosBid(maybeProvider, _apis, network)

  const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
  const metaUploader = new MetaUploader(Blockchain.TEZOS, preprocessMeta)

  return {
    nft: {
      mint: new MethodWithPrepare(mintService.mintBasic, mintService.mint) as IMint,
      burn: new MethodWithPrepare(burnService.burnBasic, burnService.burn),
      transfer: new MethodWithPrepare(transferService.transferBasic, transferService.transfer),
      generateTokenId: new TezosTokenId(maybeProvider).generateTokenId,
      createCollection: createCollectionSimplified,
      preprocessMeta,
      uploadMeta: metaUploader.uploadMeta,
    },
    order: {
      fill: { prepare: fillService.buy },
      buy: new MethodWithPrepare(fillService.buyBasic, fillService.buy),
      batchBuy: new MethodWithPrepare(fillService.batchBuyBasic, fillService.batchBuy),
      acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.acceptBid),
      sell: new MethodWithPrepare(sellService.sellBasic, sellService.sell),
      sellUpdate: new MethodWithPrepare(sellService.sellUpdateBasic, sellService.update),
      bid: new MethodWithPrepare(bidService.bidBasic, bidService.bid),
      bidUpdate: new MethodWithPrepare(bidService.updateBasic, bidService.update),
      cancel: cancelService.cancelBasic,
    },
    balances: {
      getBalance: balanceService.getBalance,
      convert: notImplemented,
      transfer: notImplemented,
      getBiddingBalance: nonImplementedAction,
      depositBiddingBalance: nonImplementedAction,
      withdrawBiddingBalance: nonImplementedAction,
    },
    restriction: {
      canTransfer: new TezosCanTransfer(maybeProvider).canTransfer,
      getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
        return sellService.getFutureOrderFees()
      },
    },
  }
}
