import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IRaribleSdk } from "./domain"
import { getSDKBlockchainInstance } from "./sdk-blockchains"

export async function createRaribleSdk(wallet: BlockchainWallet): Promise<IRaribleSdk> {
	return getSDKBlockchainInstance(wallet)
}
