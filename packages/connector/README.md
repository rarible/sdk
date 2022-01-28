# Rarible SDK Wallet Connector

## Install

Yarn
```shell
    yarn add @rarible/connector
    # optional: add additional connectors
    yarn add @rarible/connector-walletconnect
    yarn add @rarible/connector-fortmatic
    # check other @rarible/connector-* packages to see what's supported 
```

NPM
```shell
    npm i @rarible/connector
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

// create providers with the required options
const injected = new InjectedWeb3ConnectionProvider()
const walletConnect = new WalletConnectConnectionProvider()
	
// create connector and push providers to it 
const connector = Connector
    .create([injected, walletConnect])
		
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
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "@rarible/sdk"
import {
	Connector,
	ConnectionProvider,
	MEWConnectionProvider,
	InjectedWeb3ConnectionProvider,
	BeaconConnectionProvider,
	FclConnectionProvider,
	AbstractConnectionProvider,
	EthereumProviderConnectionResult,
	FlowProviderConnectionResult,
	TezosProviderConnectionResult
} from "@rarible/connector";

type ProviderResult = EthereumProviderConnectionResult | FlowProviderConnectionResult | TezosProviderConnectionResult;

function mapToBlockchainWallet<O, C extends ProviderResult>(provider: AbstractConnectionProvider<O, C>): ConnectionProvider<O, BlockchainWallet> {
	return provider.map((wallet) => {
		switch (wallet.blockchain) {
			case Blockchain.ETHEREUM: {
				return new EthereumWallet(new Web3Ethereum({ web3: new Web3(wallet.provider), from: wallet.address }))
			}
			case Blockchain.TEZOS: {
				return new TezosWallet(wallet.provider)
			}
			case Blockchain.FLOW: {
				return new FlowWallet(wallet.fcl)
			}
			default:
				throw new Error("Unknown blockchain")
		}
	})
}

const injected = mapToBlockchainWallet(new InjectedWeb3ConnectionProvider())

const mew = mapToBlockchainWallet(new MEWConnectionProvider({
	networkId: 4,
	rpcUrl: "https://node-rinkeby.rarible.com"
}));

const beacon = mapToBlockchainWallet(new BeaconConnectionProvider({
	appName: "Rarible Test",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET
}));

const fcl = mapToBlockchainWallet(new FclConnectionProvider({
	accessNode: "https://access-testnet.onflow.org",
	walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
	network: "testnet",
	applicationTitle: "Rari Test",
	applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812"
}));

const state: ConnectorState = {
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
	.add(mew)
	.add(beacon)
	.add(fcl);

connector.connection.subscribe((con) => {
	console.log("connection: " + JSON.stringify(con))
	if (con.status === "connected") {
		const sdk = createRaribleSdk(con.connection, "staging")
		// use sdk here
	}
});

const options = await connector.getOptions();
await connector.connect(options[0]);
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

