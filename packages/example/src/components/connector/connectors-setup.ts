import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import { EthereumWallet, FlowWallet, TezosWallet } from "@rarible/sdk-wallet"
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import {
	AbstractConnectionProvider,
	ConnectionProvider,
	Connector,
	EthereumProviderConnectionResult,
	IConnectorStateProvider,
	InjectedWeb3ConnectionProvider,
} from "@rarible/connector"
import { FclConnectionProvider, FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { MEWConnectionProvider } from "@rarible/connector-mew"
import { BeaconConnectionProvider, TezosProviderConnectionResult } from "@rarible/connector-beacon"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"
import type { IWalletAndAddress } from "./wallet-connetion"
import { Blockchain } from "@rarible/api-client"
// import { FortmaticConnectionProvider } from "@rarible/connector-fortmatic"
// import { PortisConnectionProvider } from "@rarible/connector-portis"


const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com",
	137: "https://polygon-rpc.com",
	80001: "https://rpc-mumbai.matic.today"
}

const ethereumNetworkMap: Record<number, string> = {
	1: "mainnet",
	3: "ropsten",
	4: "rinkeby",
	17: "e2e",
	137: "polygon",
	80001: "mumbai"
}

function environmentToEthereumChainId(environment: RaribleSdkEnvironment) {
	switch (environment) {
		case "prod":
			return 1
		case "dev":
			return 3
		case "e2e":
			return 17
		case "staging":
		default:
			return 4
	}
}

function environmentToFlowNetwork(environment: RaribleSdkEnvironment) {
	switch (environment) {
		case "prod":
			return {
				network: "mainnet",
				accessNode: "https://access.onflow.org",
				walletDiscovery: "https://flow-wallet.blocto.app/authn",
			}
		case "dev":
		case "e2e":
		case "staging":
		default:
			return {
				network: "testnet",
				accessNode: "https://access-testnet.onflow.org",
				walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
			}
	}
}

function environmentToTezosNetwork(environment: RaribleSdkEnvironment) {
	switch (environment) {
		case "prod":
			return {
				accessNode: "https://tezos-node.rarible.org",
				network: TezosNetwork.MAINNET
			}
		case "dev":
		case "e2e":
		case "staging":
		default:
			return {
				accessNode: "https://tezos-hangzhou-node.rarible.org",
				network: TezosNetwork.HANGZHOUNET
			}
	}
}

function mapEthereumWallet<O>(provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new EthereumWallet(new Web3Ethereum({ web3: new Web3(state.provider), from: state.address })),
		address: state.address,
		blockchain: getEvmBlockchain(state.chainId)
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

function mapFlowWallet<O>(provider: AbstractConnectionProvider<O, FlowProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new FlowWallet(state.fcl),
		address: state.address,
		blockchain: Blockchain.FLOW,
	}))
}

function mapTezosWallet<O>(provider: AbstractConnectionProvider<O, TezosProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(async state => {
		const {
			beacon_provider: createBeaconProvider
		} = await import("@rarible/tezos-sdk/dist/providers/beacon/beacon_provider")
		const provider = await createBeaconProvider(state.wallet as any, state.toolkit)

		return {
			wallet: new TezosWallet(provider),
			address: state.address,
			blockchain: Blockchain.TEZOS
		}
	})
}

const state: IConnectorStateProvider = {
	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem("saved_provider")
		return value ? value : undefined
	},
	async setValue(value: string | undefined): Promise<void> {
		localStorage.setItem("saved_provider", value || "")
	},
}

export function getConnector(environment: RaribleSdkEnvironment) {
	const ethChainId = environmentToEthereumChainId(environment)
	const ethNetworkName = ethereumNetworkMap[ethChainId]
	const isEthNetwork = ["mainnet", "ropsten", "rinkeby"].includes(ethNetworkName)
	const flowNetwork = environmentToFlowNetwork(environment)
	const tezosNetwork = environmentToTezosNetwork(environment)

	const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())

	const mew = mapEthereumWallet(new MEWConnectionProvider({
		networkId: ethChainId,
		rpcUrl: ethereumRpcMap[ethChainId]
	}))

	const beacon: ConnectionProvider<"beacon", IWalletAndAddress> = mapTezosWallet(new BeaconConnectionProvider({
		appName: "Rarible Test",
		accessNode: tezosNetwork.accessNode,
		network: tezosNetwork.network
	}))

	const fcl = mapFlowWallet(new FclConnectionProvider({
		accessNode: flowNetwork.accessNode,
		walletDiscovery: flowNetwork.walletDiscovery,
		network: flowNetwork.network,
		applicationTitle: "Rari Test",
		applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812"
	}))

	let torus = undefined
	if (isEthNetwork) {
		torus = mapEthereumWallet(new TorusConnectionProvider({
			network: {
				host: ethNetworkName
			}
		}))
	}

	const walletLink = mapEthereumWallet(new WalletLinkConnectionProvider({
		networkId: ethChainId,
		estimationUrl: ethereumRpcMap[ethChainId],
		url: ethereumRpcMap[ethChainId]
	}, {
		appName: "Rarible",
		appLogoUrl: "https://rarible.com/static/logo-500.static.png",
		darkMode: false,
	}))

	const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider({
		rpc: ethereumRpcMap,
		chainId: ethChainId,
	}))

	// Providers required secrets
	// const fortmatic = mapEthereumWallet(new FortmaticConnectionProvider({ apiKey: "ENTER", ethNetwork: { chainId: 4, rpcUrl: "https://node-rinkeby.rarible.com" } }))
	// const portis = mapEthereumWallet(new PortisConnectionProvider({ appId: "ENTER", network: "rinkeby" }))

	const connector = Connector
		.create(injected, state)
		.add(walletLink)
		.add(mew)
		.add(beacon)
		.add(fcl)
		.add(walletConnect)
	// .add(portis)
	// .add(fortmatic)

	if (torus) {
		return connector.add(torus)
	}

	return connector
}