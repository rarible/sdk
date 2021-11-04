import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkConfig } from "../config/domain"
import type { IApisSdk, IRaribleInternalSdk } from "../domain"
import { createEthereumSdk } from "./ethereum"
import { createFlowSdk } from "./flow"
import { createTezosSdk } from "./tezos"

export function getSDKBlockchainInstance(
	wallet: BlockchainWallet,
	apis: IApisSdk,
	config: RaribleSdkConfig
): IRaribleInternalSdk {
	switch (wallet.blockchain) {
		case "ETHEREUM":
			return createEthereumSdk(wallet, apis, config.ethereumEnv)
		case "FLOW":
			return createFlowSdk(wallet, apis, config.flowEnv)
		case "TEZOS":
			return createTezosSdk(wallet)
		default:
			throw new Error("Unsupported wallet blockchain")
	}
}
