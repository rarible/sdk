import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import { IRaribleSdk } from "../../domain"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"

export function createFlowSdk(wallet: FlowWallet, auth?: AuthWithPrivateKey): IRaribleSdk {
	const sdk = createFlowSdkInstance(wallet.fcl, wallet.network, auth)

	return {
		nft: {
			mint: new FlowMint(sdk).prepare,
			burn: null as any,
			transfer: null as any,
		},
		order: {
			sell: new FlowSell(sdk, wallet).sell,
			fill: new FlowBuy(sdk, wallet).buy,
			bid: null as any,
		},
	}
}
