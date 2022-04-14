import type { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance, FLOW_ENV_CONFIG } from "@rarible/flow-sdk"
import type { AuthWithPrivateKey, FlowEnv } from "@rarible/flow-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { notImplemented } from "../../common/not-implemented"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"
import { FlowCancel } from "./cancel"
import { FlowBalance } from "./balance"
import { FlowBid } from "./bid"
import { FlowCreateCollection } from "./create-collection"

export function createFlowSdk(
	wallet: Maybe<FlowWallet>,
	apis: IApisSdk,
	network: FlowEnv,
	params?: ConfigurationParameters,
	auth?: AuthWithPrivateKey,
): IRaribleInternalSdk {
	const sdk = createFlowSdkInstance(wallet?.fcl, network, params, auth)
	const blockchainNetwork = FLOW_ENV_CONFIG[network].network
	const sellService = new FlowSell(sdk, apis)
	const mintService = new FlowMint(sdk, apis, blockchainNetwork)
	const bidService = new FlowBid(sdk)
	const collectionsService = new FlowCreateCollection(sdk, blockchainNetwork)

	return {
		nft: {
			mint: mintService.prepare,
			burn: new FlowBurn(sdk, blockchainNetwork).burn,
			transfer: new FlowTransfer(sdk, blockchainNetwork).transfer,
			generateTokenId: () => Promise.resolve(undefined),
			deploy: collectionsService.createCollection,
			createCollection: collectionsService.createCollection,
			preprocessMeta: Middlewarer.skipMiddleware(mintService.preprocessMeta),
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
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
