import type{ BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { initProvider, initProviders } from "@rarible/sdk/src/sdk-blockchains/ethereum/test/init-providers"
import { EthereumWallet } from "@rarible/sdk-wallet"
import type { TezosWallet } from "@rarible/sdk-wallet"
import { createTestWallet as createTezosWallet } from "@rarible/sdk/src/sdk-blockchains/tezos/test/test-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"

export function getEthereumWallet(pk?: string): EthereumWallet {
	const { web3, wallet } = initProvider(pk)
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: wallet.getAddressString(),
	})
	return new EthereumWallet(ethereum)
}

export function getTezosWallet(): TezosWallet {
	return createTezosWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
}

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
