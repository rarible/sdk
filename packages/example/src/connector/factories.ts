import type {
	AbstractConnectionProvider,
	ConnectionProvider, DappType,
	EthereumProviderConnectionResult,
	IConnector
} from "@rarible/connector"
import { InjectedWeb3ConnectionProvider } from "@rarible/connector"
import { Connector } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import Web3 from "web3"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { Blockchain } from "@rarible/api-client"
import { WalletConnectConnectionProviderV2 } from "@rarible/connector-walletconnect-v2"
import { ethereumRpcMap } from "../components/connector/connectors-setup"

type CreateConnectionConfig = {
	providers: ConnectionProvider<string, IWalletAndAddress>[]
}

export type InjectedWeb3ConnectionConfig = {
	prefer?: DappType[]
}

export function createConnector(config: CreateConnectionConfig): IConnector<string, IWalletAndAddress> {
	return new Connector(config.providers)
}

export function injected(config: InjectedWeb3ConnectionConfig = { prefer: [] },) {
	return mapEthereumWallet(new InjectedWeb3ConnectionProvider(config))
}

export function walletConnectV2() {
	return mapEthereumWallet(new WalletConnectConnectionProviderV2({
		projectId: "4f9fb88799dfa8d3654bdd130be840f2",
		chains: [1],
		optionalChains: Object.keys(ethereumRpcMap)
			.map((x) => +x)
			.filter((x) => x !== 1),
		showQrModal: true,
		methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
		optionalMethods: [
			"eth_accounts",
			"eth_requestAccounts",
			"eth_sendRawTransaction",
			"eth_sign",
			"eth_signTransaction",
			"eth_signTypedData",
			"eth_signTypedData_v3",
			"eth_signTypedData_v4",
			"wallet_switchEthereumChain",
			"wallet_addEthereumChain",
			"wallet_getPermissions",
			"wallet_requestPermissions",
			"wallet_registerOnboarding",
			"wallet_watchAsset",
			"wallet_scanQRCode",
		],
		events: ["chainChanged", "accountsChanged"],
		optionalEvents: ["message", "disconnect", "connect"],
		rpcMap: ethereumRpcMap,
	})
	)
}

function mapEthereumWallet<O>(
	provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => {
		const blockchain = getEvmBlockchain(state.chainId)
		let web3: Web3 = new Web3(state.provider)

		return {
			wallet: new EthereumWallet(
				new Web3Ethereum({
					web3,
					from: state.address,
				})
			),
			address: state.address,
			blockchain,
		}
	})
}

function getEvmBlockchain(chainId: number): EVMBlockchain {
	switch (chainId) {
		case 137:
		case 80001:
		case 300501:
		case 200501: return Blockchain.POLYGON
		case 5000:
		case 5001: return Blockchain.MANTLE
		case 42161:
		case 421614: return Blockchain.ARBITRUM
		case 300:
		default: return Blockchain.ETHEREUM
	}
}
