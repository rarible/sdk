import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import { IRaribleSdk } from "../../domain"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"

export function createFlowSdk(wallet: FlowWallet, auth?: AuthWithPrivateKey): Omit<IRaribleSdk, "apis"> {
	const sdk = createFlowSdkInstance(wallet.fcl, wallet.network, auth)

	return {
		nft: {
			mint: new FlowMint(sdk).prepare,
			burn: new FlowBurn(sdk).burn,
			transfer: new FlowTransfer(sdk).transfer,
		},
		order: {
			sell: new FlowSell(sdk, wallet).sell,
			sellUpdate: null as any,
			fill: new FlowBuy(sdk, wallet).buy,
			bid: null as any,
			bidUpdate: null as any,
		},
	}
}
