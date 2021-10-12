import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IRaribleSdk } from "./domain"
import { getSDKBlockchainInstance } from "./sdk-blockchains"

export function createRaribleSdk(wallet: BlockchainWallet): IRaribleSdk {
	return getSDKBlockchainInstance(wallet)
}
