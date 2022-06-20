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

	const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.FLOW, preprocessMeta)

	return {

		nft: {
			mint: mintService.prepare,
			burn: new FlowBurn(sdk, blockchainNetwork).burn,
			transfer: new FlowTransfer(sdk, blockchainNetwork).transfer,
			generateTokenId: () => Promise.resolve(undefined),
			deploy: nonImplementedAction,
			createCollection: nonImplementedAction,
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			sell: sellService.sell,
			sellUpdate: sellService.update,
			fill: new FlowBuy(sdk, apis, blockchainNetwork).buy,
			buy: new FlowBuy(sdk, apis, blockchainNetwork).buy,
			acceptBid: new FlowBuy(sdk, apis, blockchainNetwork).buy,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new FlowCancel(sdk, apis, blockchainNetwork).cancel,
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
