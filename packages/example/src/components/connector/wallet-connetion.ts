import { BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"

export interface IWalletAndAddress {
	wallet: BlockchainWallet
	address: string
	blockchain: Blockchain
}
