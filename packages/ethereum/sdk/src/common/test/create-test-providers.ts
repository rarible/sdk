import type Wallet from "ethereumjs-wallet"
import Web3 from "web3"
import { ethers } from "ethers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"

/**
 * @deprecated please use createTestAdapters instead
 */
export function createTestProviders(provider: any, wallet: Wallet) {
	const web3 = new Web3(provider)
	const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)

	return {
		web3,
		providers: [
			new Web3Ethereum({ web3 }),
			new EthersEthereum(new ethers.Wallet(wallet.getPrivateKeyString(), ethersWeb3Provider)),
			new EthersWeb3ProviderEthereum(ethersWeb3Provider),
		],
	}
}
