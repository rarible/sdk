import type { AbstractConnectionProvider, ConnectionProvider, EthereumProviderConnectionResult } from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { Blockchain } from "@rarible/api-client"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new EthereumWallet(new Web3Ethereum({ web3: new Web3(state.provider), from: state.address })),
		address: state.address,
		blockchain: getEvmBlockchain(state.chainId),
	}))
}

function getEvmBlockchain(chainId: number): Blockchain.POLYGON | Blockchain.ETHEREUM {
	switch (chainId) {
		case 137: return Blockchain.POLYGON
		case 80001: return Blockchain.POLYGON
		case 300501: return Blockchain.POLYGON
		case 200501: return Blockchain.POLYGON
		default: return Blockchain.ETHEREUM
	}
}
