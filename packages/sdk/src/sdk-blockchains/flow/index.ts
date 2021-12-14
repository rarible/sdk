import type { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import type { AuthWithPrivateKey, FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { CanTransferResult } from "../../types/nft/restriction/domain"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"
import { FlowCancel } from "./cancel"
import { FlowBalance } from "./balance"

export function createFlowSdk(
	wallet: Maybe<FlowWallet>,
	apis: IApisSdk,
	network: FlowNetwork,
	auth?: AuthWithPrivateKey
): IRaribleInternalSdk {
	const sdk = createFlowSdkInstance(wallet?.fcl, network, auth)
	const sellService = new FlowSell(sdk, apis)
	const mintService = new FlowMint(sdk, apis, network)

	return {
		nft: {
			mint: mintService.prepare,
			burn: new FlowBurn(sdk, network).burn,
			transfer: new FlowTransfer(sdk, network).transfer,
			generateTokenId: () => Promise.resolve(undefined),
			deploy: nonImplementedAction,
			preprocessMeta: mintService.preprocessMeta,
		},
		order: {
			sell: sellService.sell,
			sellUpdate: sellService.update,
			fill: new FlowBuy(sdk, apis, network).buy,
			buy: new FlowBuy(sdk, apis, network).buy,
			acceptBid: notImplemented,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: new FlowCancel(sdk, apis, network).cancel,
		},
		balances: {
			getBalance: new FlowBalance(sdk).getBalance,
		},
		restriction: {
			canTransfer(): Promise<CanTransferResult> {
				return Promise.resolve({ success: true })
			},
		},
	}
}
