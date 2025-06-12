# Rarible SDK Wallet Connector

## Install

Yarn
```shell
    yarn add @rarible/connector
    yarn add @rarible/connector-helper
    # optional: add additional connectors
    yarn add @rarible/connector-walletconnect-v2
    yarn add @rarible/connector-fortmatic
    # check other @rarible/connector-* packages to see what's supported 
```

NPM
```shell
    npm i @rarible/connector
    npm i @rarible/connector-helper
    # optional: add additional connectors
    npm i @rarible/connector-walletconnect-v2
    npm i @rarible/connector-fortmatic
    # check other @rarible/connector-* packages to see what's supported 
```

## Usage

#### Create `Connector`, add all needed `ConnectionProvider's`

```ts
import { Connector, InjectedWeb3ConnectionProvider, DappType } from "@rarible/connector"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect-v2"
import { mapEthereumWallet, mapFlowWallet } from "@rarible/connector-helper"

// create providers with the required options
const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())
const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider())
	
// create connector and push providers to it 
const connector = Connector
  .create(injected)
  .add(walletConnect)
		
// subscribe to connection status
connector.connection.subscribe((con) =>
    console.log("connection: " + JSON.stringify(con))
)

const options = await connector.getOptions(); // get list of available option
await connector.connect(options[0]); // connect to selected provider
```

### Usage with Rarible SDK

```ts
import Web3 from "web3"
import { BlockchainWallet, FlowWallet, EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import {
	Connector,
	IConnectorStateProvider,
	ConnectionProvider,
	InjectedWeb3ConnectionProvider,
	AbstractConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { FclConnectionProvider, FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { WalletConnectConnectionProviderV2 } from "@rarible/connector-walletconnect-v2"
import { FortmaticConnectionProvider } from "@rarible/connector-fortmatic"
import { PortisConnectionProvider } from "@rarible/connector-portis"
import { mapEthereumWallet, mapFlowWallet } from "@rarible/connector-helper"

const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com",
}

export type WalletAndAddress = {
	wallet: BlockchainWallet
	address: string
}

const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())


const fcl = mapFlowWallet(new FclConnectionProvider({
	accessNode: "https://access-testnet.onflow.org",
	walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
	network: "testnet",
	applicationTitle: "Rari Test",
	applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812"
}))

const torus = mapEthereumWallet(new TorusConnectionProvider({
	network: {
		host: "rinkeby"
	}
}))

const walletLink = mapEthereumWallet(new WalletLinkConnectionProvider({
	estimationUrl: ethereumRpcMap[4],
	networkId: 4,
	url: ethereumRpcMap[4]
}, {
	appName: "Rarible",
	appLogoUrl: "https://rarible.com/static/logo-500.static.png",
	darkMode: false
}))

const walletConnectV2 = mapEthereumWallet(new WalletConnectConnectionProviderV2({
	projectId: "4f9fb88799dfa8d3654bdd130be840f2",
	chains: [1, 5],
	showQrModal: true,
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

const connector = Connector
    .create(injected, state) // use ConnectionState for store connector data (last connected provider, etc)
	.add(torus)
	.add(walletLink)
	.add(fcl)
	.add(walletConnectV2)
    // .add(portis)
    // .add(fortmatic)


connector.connection.subscribe((con) => {
	console.log("connection: " + JSON.stringify(con))
	if (con.status === "connected") {
		const sdk = createRaribleSdk(con.connection.wallet, "staging")
		// use sdk here
	}
})

const options = await connector.getOptions()
await connector.connect(options[0])
```

## Available providers

Ethereum providers

```
InjectedWeb3ConnectionProvider - metamask, coinbase, etc
FortmaticConnectionProvider
PortisConnectionProvider
TorusConnectionProvider
WalletLinkConnectionProvider
IframeConnectionProvider
WalletConnectConnectionProviderV2
```

Flow providers

```
FclConnectionProvider
```

