import type { AbstractConnectionProvider, ConnectionProvider, EthereumProviderConnectionResult } from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import type { WalletAndAddress } from "./common"

export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>,
): ConnectionProvider<O, WalletAndAddress> {
	return provider.map(state => ({
		wallet: new EthereumWallet(
			new Web3Ethereum({ web3: new Web3(state.provider), from: state.address }),
		),
		address: state.address,
	}))
}
