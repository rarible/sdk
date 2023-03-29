import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { Blockchain } from "@rarible/api-client"

export interface IWalletAndAddress {
	wallet: BlockchainWallet
	address: string
	blockchain: Blockchain
}
