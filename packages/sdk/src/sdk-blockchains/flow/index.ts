import type { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import type { AuthWithPrivateKey, FlowEnv } from "@rarible/flow-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import { ENV_CONFIG } from "@rarible/flow-sdk/build/config/env"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { SimplifiedWithActionClass, SimplifiedWithPrepareClass } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"
import { FlowCancel } from "./cancel"
import { FlowBalance } from "./balance"
import { FlowBid } from "./bid"

export function createFlowSdk(
	wallet: Maybe<FlowWallet>,
	apis: IApisSdk,
	network: FlowEnv,
	params?: ConfigurationParameters,
	auth?: AuthWithPrivateKey,
): IRaribleInternalSdk {
	const sdk = createFlowSdkInstance(wallet?.fcl, network, params, auth)
	const blockchainNetwork = ENV_CONFIG[network].network
	const sellService = new FlowSell(sdk, apis)
	const mintService = new FlowMint(sdk, apis, blockchainNetwork)
	const bidService = new FlowBid(sdk)
	const burnService = new FlowBurn(sdk, blockchainNetwork)
	const transferService = new FlowTransfer(sdk, blockchainNetwork)
	const fillService = new FlowBuy(sdk, apis, blockchainNetwork)
	const cancelService = new FlowCancel(sdk, apis, blockchainNetwork)

	const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.FLOW, preprocessMeta)

	return {
		nft: {
			mint: new SimplifiedWithPrepareClass(mintService.mintBasic, mintService.prepare) as IMint,
			burn: new SimplifiedWithPrepareClass(burnService.burnBasic, burnService.burn),
			transfer: new SimplifiedWithPrepareClass(transferService.transferBasic, transferService.transfer),
			generateTokenId: () => Promise.resolve(undefined),
			deploy: new SimplifiedWithActionClass(notImplemented, nonImplementedAction),
			createCollection: new SimplifiedWithActionClass(notImplemented, nonImplementedAction),
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			fill: { prepare: fillService.buy },
			sell: new SimplifiedWithPrepareClass(sellService.sellBasic, sellService.sell),
			sellUpdate: new SimplifiedWithPrepareClass(sellService.sellUpdateBasic, sellService.update),
			buy: new SimplifiedWithPrepareClass(fillService.buyBasic, fillService.buy),
			acceptBid: new SimplifiedWithPrepareClass(fillService.acceptBidBasic, fillService.buy),
			bid: new SimplifiedWithPrepareClass(bidService.bidBasic, bidService.bid),
			bidUpdate: new SimplifiedWithPrepareClass(bidService.bidUpdateBasic, bidService.update),
			cancel: new SimplifiedWithActionClass(cancelService.cancelBasic, cancelService.cancel),
		},
		balances: {
			getBalance: new FlowBalance(sdk, network, wallet).getBalance,
			convert: notImplemented,
			getBiddingBalance: nonImplementedAction,
			depositBiddingBalance: nonImplementedAction,
			withdrawBiddingBalance: nonImplementedAction,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
