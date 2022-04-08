import type { BlockchainWallet } from "@rarible/sdk-wallet"

export type WalletAndAddress = {
	wallet: BlockchainWallet
	address: string
}
