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
		nftBasic: {
			mint: mintService.mintBasic,
			transfer: transferService.transferBasic,
			burn: burnService.burnBasic,
			createCollection: notImplemented,
		},
		orderBasic: {
			sell: sellService.sellBasic,
			sellUpdate: sellService.sellUpdateBasic,
			buy: fillService.buyBasic,
			acceptBid: fillService.acceptBidBasic,
			bid: bidService.bidBasic,
			bidUpdate: bidService.bidUpdateBasic,
			cancel: cancelService.cancelBasic,
		},
		nft: {
			mint: mintService.prepare,
			burn: burnService.burn,
			transfer: transferService.transfer,
			generateTokenId: () => Promise.resolve(undefined),
			deploy: nonImplementedAction,
			createCollection: nonImplementedAction,
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			sell: sellService.sell,
			sellUpdate: sellService.update,
			fill: fillService.buy,
			buy: fillService.buy,
			acceptBid: fillService.buy,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: cancelService.cancel,
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
