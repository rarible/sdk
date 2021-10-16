import { BlockchainWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../domain"
import { createEthereumSdk } from "./ethereum"
import { createFlowSdk } from "./flow"
import { createTezosSdk } from "./tezos"

export async function getSDKBlockchainInstance(wallet: BlockchainWallet): Promise<IRaribleSdk> {
	if (wallet.blockchain === "ETHEREUM") {
		return createEthereumSdk(wallet)
	} else if (wallet.blockchain === "FLOW") {
		return createFlowSdk(wallet)
	} else if (wallet.blockchain === "TEZOS") {
		return await createTezosSdk(wallet)
	} else {
		throw new Error("Unsupported wallet blockchain")
	}
}
