import { BlockchainWallet, EthereumWallet, FlowWallet } from "@rarible/sdk-wallet/src"
import { IRaribleSdk } from "../../domain"

export function createFlowSdk(wallet: FlowWallet): IRaribleSdk {
	// const sdk = createRaribleSdk(wallet, options.env, ...)

	return {
		nft: {
			mint: {
				prepare: null as any,
			},
		},
	}
}
