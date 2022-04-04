# Rarible SDK Wallet Connector

## Install

Yarn
```shell
    yarn add @rarible/connector
    yarn add @rarible/connector-helper
    # optional: add additional connectors
    yarn add @rarible/connector-walletconnect
    yarn add @rarible/connector-fortmatic
    # check other @rarible/connector-* packages to see what's supported 
```

NPM
```shell
    npm i @rarible/connector
    npm i @rarible/connector-helper
    # optional: add additional connectors
    npm i @rarible/connector-walletconnect
    npm i @rarible/connector-fortmatic
    # check other @rarible/connector-* packages to see what's supported 
```

## Usage

#### Create `Connector`, add all needed `ConnectionProvider's`

```ts
import { Connector, InjectedWeb3ConnectionProvider, DappType } from "@rarible/connector"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"
import { mapEthereumWallet, mapFlowWallet, mapTezosWallet } from "@rarible/connector-helper"

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
import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import Web3 from "web3"
import { BlockchainWallet, FlowWallet, TezosWallet, EthereumWallet } from "@rarible/sdk-wallet"
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
import { MEWConnectionProvider } from "@rarible/connector-mew"
import { BeaconConnectionProvider, TezosProviderConnectionResult } from "@rarible/connector-beacon"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"
import { FortmaticConnectionProvider } from "@rarible/connector-fortmatic"
import { PortisConnectionProvider } from "@rarible/connector-portis"
import { mapEthereumWallet, mapFlowWallet, mapTezosWallet } from "@rarible/connector-helper"

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

const mew = mapEthereumWallet(new MEWConnectionProvider({
	networkId: 4,
	rpcUrl: ethereumRpcMap[4]
}))

const beacon = mapTezosWallet(new BeaconConnectionProvider({
	appName: "Rarible Test",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET
}))

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

const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider({
	rpc: {
		4: "https://node-rinkeby.rarible.com"
	},
	chainId: 4
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
	.add(mew)
	.add(beacon)
	.add(fcl)
	.add(walletConnect)
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
MEWConnectionProvider
IframeConnectionProvider
WalletConnectConnectionProvider
```

Tezos providers

```
BeaconConnectionProvider
```

Flow providers

```
FclConnectionProvider
```

