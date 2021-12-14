import type{ BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"

export async function getWalletAddress(wallet: BlockchainWallet, withPrefix: boolean = true): Promise<string> {
	switch (wallet.blockchain) {
		case Blockchain.ETHEREUM:
			return (withPrefix ? "ETHEREUM:" : "") + (await wallet.ethereum.getFrom())
		case Blockchain.TEZOS:
			return (withPrefix ? "TEZOS:" : "") + (await wallet.provider.address())
		case Blockchain.FLOW:
		default:
			throw new Error(`Unsupported blockchain ${wallet.blockchain}`)
	}
}
