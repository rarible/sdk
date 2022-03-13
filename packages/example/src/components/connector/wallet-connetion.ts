import { BlockchainWallet } from "@rarible/sdk-wallet"

export interface IWalletAndAddress {
	wallet: BlockchainWallet
	address: string
}
