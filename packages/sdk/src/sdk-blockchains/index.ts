import { BlockchainWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../domain"
import { Config } from "../config/type"
import { createEthereumSdk } from "./ethereum"
import { createFlowSdk } from "./flow"
import { createTezosSdk } from "./tezos"

export function getSDKBlockchainInstance(wallet: BlockchainWallet, config: Config): Omit<IRaribleSdk, "apis"> {
	if (wallet.blockchain === "ETHEREUM") {
		return createEthereumSdk(wallet, config.ethereumEnv)
	} else if (wallet.blockchain === "FLOW") {
		return createFlowSdk(wallet)
	} else if (wallet.blockchain === "TEZOS") {
		return createTezosSdk(wallet)
	} else {
		throw new Error("Unsupported wallet blockchain")
	}
}
