import { FlowWallet } from "@rarible/sdk-wallet"
import { createFlowSdk as createFlowSdkInstance } from "@rarible/flow-sdk"
import { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { FlowMint } from "./mint"
import { FlowSell } from "./sell"
import { FlowBuy } from "./buy"
import { FlowTransfer } from "./transfer"
import { FlowBurn } from "./burn"
import { FlowCancel } from "./cancel"

export function createFlowSdk(wallet: FlowWallet, apis: IApisSdk, auth?: AuthWithPrivateKey): IRaribleInternalSdk {
	const sdk = createFlowSdkInstance(wallet.fcl, wallet.network, auth)
	const sellService = new FlowSell(sdk, wallet)

	return {
		nft: {
			mint: new FlowMint(sdk, apis).prepare,
			burn: new FlowBurn(sdk).burn,
			transfer: new FlowTransfer(sdk).transfer,
		},
		order: {
			sell: sellService.sell,
			sellUpdate: sellService.update,
			fill: new FlowBuy(sdk, wallet).buy,
			bid: null as any,
			bidUpdate: null as any,
			cancel: new FlowCancel(sdk, wallet).cancel,
		},
	}
}
