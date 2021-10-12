import { BlockchainWallet } from "@rarible/sdk-wallet/src"
import { IRaribleSdk } from "../domain"
import { createEthereumSdk } from "./ethereum"
import { createFlowSdk } from "./flow"

export function getSDKBlockchainInstance(wallet: BlockchainWallet): IRaribleSdk {
	if (wallet.blockchain === "ETHEREUM") {
		return createEthereumSdk(wallet)
	} else if (wallet.blockchain === "FLOW") {
		return createFlowSdk(wallet)
	} else {
		throw new Error("Unsupported wallet blockchain")
	}
}
