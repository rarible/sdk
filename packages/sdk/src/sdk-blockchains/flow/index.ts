import { FlowWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../../domain"
import { PrepareMintRequest } from "../../nft/mint/prepare-mint-request.type"

export function createFlowSdk(wallet: FlowWallet): Omit<IRaribleSdk, "apis"> {
	// const sdk = createRaribleSdk(wallet, options.env, ...)

	return {
		nft: {
			mint: null as any,
			burn: null as any,
			transfer: null as any,
		},
		order: {
			fill: null as any,
			sell: null as any,
			bid: null as any,
		},
	}
}
