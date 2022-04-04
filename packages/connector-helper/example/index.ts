import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import type {
	IConnectorStateProvider,
} from "@rarible/connector"
import {
	Connector,
	InjectedWeb3ConnectionProvider,
} from "@rarible/connector"
import { FclConnectionProvider } from "@rarible/connector-fcl"
import { MEWConnectionProvider } from "@rarible/connector-mew"
import { BeaconConnectionProvider } from "@rarible/connector-beacon"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"
import { createRaribleSdk } from "@rarible/sdk"
import {
	mapEthereumWallet,
	mapTezosWallet,
	mapFlowWallet,
} from "../src"


const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com",
}

const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())

const mew = mapEthereumWallet(new MEWConnectionProvider({
	networkId: 4,
	rpcUrl: ethereumRpcMap[4],
}))

const beacon = mapTezosWallet(new BeaconConnectionProvider({
	appName: "Rarible Test",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET,
}))

const fcl = mapFlowWallet(new FclConnectionProvider({
	accessNode: "https://access-testnet.onflow.org",
	walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
	network: "testnet",
	applicationTitle: "Rari Test",
	applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812",
}))

const torus = mapEthereumWallet(new TorusConnectionProvider({
	network: {
		host: "rinkeby",
	},
}))

const walletLink = mapEthereumWallet(new WalletLinkConnectionProvider({
	estimationUrl: ethereumRpcMap[4],
	networkId: 4,
	url: ethereumRpcMap[4],
}, {
	appName: "Rarible",
	appLogoUrl: "https://rarible.com/static/logo-500.static.png",
	darkMode: false,
}))

const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider({
	rpc: {
		4: "https://node-rinkeby.rarible.com",
	},
	chainId: 4,
}))

// Providers required secrets
// const fortmatic = mapEthereumWallet(new FortmaticConnectionProvider({ apiKey: "ENTER", ethNetwork: { chainId: 4, rpcUrl: "https://node-rinkeby.rarible.com" } }))
// const portis = mapEthereumWallet(new PortisConnectionProvider({ appId: "ENTER", network: "rinkeby" }))

const state: IConnectorStateProvider = {
	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem("saved_provider")
		return value ? value : undefined
	},
	async setValue(value: string | undefined): Promise<void> {
		localStorage.setItem("saved_provider", value || "")
	},
}

async function init() {
	const connector = Connector
		// .create(injected, state) // use ConnectionState for store connector data (last connected provider, etc)
		.create(injected) // use ConnectionState for store connector data (last connected provider, etc)
		.add(torus)
		.add(walletLink)
		.add(mew)
		.add(beacon)
		.add(fcl)
		.add(walletConnect)
	// .add(portis)
	// .add(fortmatic)


	connector.connection.subscribe((con) => {
		console.log("connection: " + JSON.stringify(con))
		if (con.status === "connected") {
			// use sdk here
			const sdk = createRaribleSdk(con.connection.wallet, "staging")
		}
	})

	const options = await connector.getOptions()
	await connector.connect(options[2])
}
init()
