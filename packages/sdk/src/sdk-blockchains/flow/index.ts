import { BlockchainWallet, EthereumWallet, FlowWallet } from "@rarible/sdk-wallet/src"
import { IRaribleSdk } from "../../domain"
import { PrepareMintRequest } from "../../nft/mint/prepare-mint-request.type"

export function createFlowSdk(wallet: FlowWallet): IRaribleSdk {
	// const sdk = createRaribleSdk(wallet, options.env, ...)

	return {
		nft: {
			mint: null as any,
		},
		order: {
			fill: null as any,
		},
	}
}
