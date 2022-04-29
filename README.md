# Rarible Protocol Software Development Kit

Rarible Multichain Protocol is a decentralized toolset that simplifies the way developers can work with NFTs. The protocol builds an abstraction layer for several blockchains and isolates the developer from their specifics with a Multichain SDK.

Rarible Multichain SDK is fully blockchain-agnostic. You can find a list of supported blockchains on our [Features](https://docs.rarible.org/features/) page.

We use different environments for blockchain networks. See actual information on [API Reference](https://docs.rarible.org/api-reference/) page.

Rarible Multichain SDK enables applications to easily interact with Rarible Protocol: query, issue and trade NFTs on any blockchain supported. See more information on our documentation [Reference](https://docs.rarible.org/reference/reference-overview/) section.

## Installation

Install Protocol SDK:

```shell
yarn add @rarible/sdk -D
yarn add web3@1.5.0
yarn add tslib@2.3.1
```

Also, you can install ethers if you need it to initialize the wallets:

```shell
yarn add ethers
```

Make sure the SDK is installed correctly:

```shell
npm view @rarible/sdk version
```

If you have any problems installing the SDK on your M1 MacBook, see our [Troubleshooting](#troubleshooting) section.

## Using SDK on client application

SDK is written in TypeScript. You can use typings to explore SDK possibilities.

### Initialize SDK

```ts
import { createRaribleSdk } from "@rarible/sdk"
```

### Initialize wallets

To use SDK, you have to create a Wallet — abstraction to communicate with real blockchain wallets.

Initialize wallets for used blockchains or use Rarible Wallet Connector (in general for frontend)
It is possible to use SDK without wallet (for ex. `sdk.balances.getBalance`), but in that case you can't send transactions and sign messages:

```ts
const raribleSdk = createRaribleSdk(undefined, "prod")
```

#### Initialize simple wallets

* Ethereum / Polygon

    You can create EthereumWallet with one of the following providers:
    
    * Web3 instance. For example, Metamask (`window.ethereum`) or HDWalletProvider
    * ethers.providers.Web3Provider
    * ethers.Wallet
    
    ```ts
    import Web3 from "web3"
    import * as HDWalletProvider from "@truffle/hdwallet-provider"
    import { Web3Ethereum } from "@rarible/web3-ethereum"
    import { ethers } from "ethers"
    import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
    import { EthereumWallet } from "@rarible/sdk-wallet"
    
    //Creating EthereumWallet with Web3
    const web3 = new Web3(provider)
    const web3Ethereum = new Web3Ethereum({ web3 })
    const ethWallet = new EthereumWallet(web3Ethereum)
    
    //or with HDWalletProvider
    const provider = new HDWalletProvider({
      url: "<NODE_URL>",
      privateKeys: ["0x0..."],
      chainId: 1,
    })
    const web3 = new Web3(provider)
    const web3Ethereum = new Web3Ethereum({ web3 })
    const ethWallet = new EthereumWallet(web3Ethereum)
    
    //Creating EthereumWallet with ethers.providers.Web3Provider
    const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
    const ethersProvider = new EthersWeb3ProviderEthereum(ethersWeb3Provider)
    const ethWallet = new EthereumWallet(ethersProvider)
    
    //Creating EthereumWallet with ethers.Wallet
    const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
    const ethersProvider = new EthersEthereum(new ethers.Wallet(wallet.getPrivateKeyString(), ethersWeb3Provider))
    const ethWallet = new EthereumWallet(ethersProvider)
    
    // Second parameter — is environment: "prod" | "staging" | "e2e" | "dev"
    const raribleSdk = createRaribleSdk(ethWallet, "staging")
    ```


* Flow

    ```ts
    import * as fcl from "@onflow/fcl"
    import { FlowWallet } from "@rarible/sdk-wallet"
    
    const wallet =  new FlowWallet(fcl)
    ```
    
    You also need to configure Flow Client Library (FCL), because Flow-sdk use [@onflow/fcl-js](link:https://github.com/onflow/fcl-js):
    
    ```javascript
    //example config for testnet
    import { config } from "@onflow/fcl";
    config({
      "accessNode.api": "https://access-testnet.onflow.org", // Mainnet: "https://access-mainnet-beta.onflow.org"
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn" // Mainnet: "https://fcl-discovery.onflow.org/authn"
    })
    ```
    
    See more configuration details on [Flow documentation](https://docs.onflow.org/fcl/tutorials/flow-app-quickstart/#configuration).


* Tezos

    To initialize wallets, you can use:
    
    * in_memory_provider (also for backend)
    * beacon_provider (@rarible/tezos-sdk/dist/providers/beacon/beacon_provider)
    
    ```ts
    //in_memory_provider usage example
    import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
    import { TezosWallet } from "@rarible/sdk-wallet"
    
    const provider = in_memory_provider("edsk...", nodeUrl)
    const wallet = new TezosWallet(provider)
    ```

#### Use Rarible SDK Wallet Connector

Wallet Connector make possible to connect the following providers:

* InjectedWeb3ConnectionProvider — Metamask, Coinbase, etc
* FortmaticConnectionProvider
* PortisConnectionProvider
* TorusConnectionProvider
* WalletLinkConnectionProvider
* MEWConnectionProvider
* IframeConnectionProvider
* WalletConnectConnectionProvider
* BeaconConnectionProvider
* FclConnectionProvider

[Read more](https://github.com/rarible/sdk/tree/master/packages/connector) about installation and using examples of Rarible SDK Wallet Connector.

## Using SDK on server application

The SDK was designed for use on the frontend side. To use the SDK on the server side (backend):

1. Install packages:

    ```shell
    yarn add tslib@2.3.1
    yarn add form-data
    yarn add node-fetch
    ```

2. Add dependencies:

    ```typescript
    global.FormData = require("form-data")
    global.window = {
      fetch: require("node-fetch"),
      dispatchEvent: () => {
      },
    }
    global.CustomEvent = function CustomEvent() {
      return
    }
    ```

3. Try our [example](https://github.com/rarible/sdk/blob/master/packages/sdk/example/backend/ethereum/buy.ts) to buy Ethereum NFT item on Rinkeby network:

   Pass private key, node RPC URL, network ID, item ID for buyout and start:

    ```shell
    ETH_PRIVATE_KEY="0x..." \
    ETHEREUM_RPC_URL="https://rinkeby.infura.io/..." \
    ETHEREUM_NETWORK_ID="4" \
    BUYOUT_ITEM_ID="0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:102581254137174039089845694331937600507918590364933200920056519678660477714440" \
    ts-node packages/sdk/example/backend/buy.ts
    ```

## Querying

Here are some basic examples of how to use APIs to query data. You can find much more methods in the doc: [https://multichain.redoc.ly/](https://multichain.redoc.ly/) or right in the typescript typings.

```ts
//Fetch items by creator
sdk.apis.item.getItemsByCreator({ creator: someAddress })

//Fetch activity (events) by the Item
sdk.apis.activity.getActivitiesByItem({ type: ["TRANSFER"], contract, tokenId })

//etc. Please explore SDK APIs and openAPI docs
```

## Executing actions

You can use SDK to create (mint), trade, transfer, and burn NFTs. All actions are handled in the same manner:

* You invoke function from SDK (e.g.: [mint](https://docs.rarible.org/reference/mint/))
* Async function returns the so-called PrepareResponse (it's different for different actions)
* PrepareResponse contains all needed information to show the user a form (for example, response for sale contains all supported currency types)
* Collect input from the user (show form and let the user enter the data)
* Pass this data to submit [Action](https://github.com/rarible/ts-common/tree/master/packages/action)

See how to use common SDK functionality in our [documentation](https://docs.rarible.org/reference/reference-overview/):

* [Quick Start](https://docs.rarible.org/getting-started/quick-start/)
* [Create collection](https://docs.rarible.org/reference/create-collection/)
* [Mint NFT](https://docs.rarible.org/reference/mint/)
* [Sell NFTs](https://docs.rarible.org/reference/order/)
* [Mint and Sell](https://docs.rarible.org/reference/mint-and-sell/)
* [Create and Accept Bid](https://docs.rarible.org/reference/bid/)
* [Transfer tokens](https://docs.rarible.org/reference/transfer/)
* [Burn tokens](https://docs.rarible.org/reference/burn/)
* [Get wallet balance](https://docs.rarible.org/reference/get-balance/)
* [Contract Addresses](https://docs.rarible.org/reference/contract-addresses/)
* [Search Capabilities](https://docs.rarible.org/reference/search-capabilities/)

## Troubleshooting

Possible errors after `npm install -D @rarible/sdk` command:

<details>
  <summary>Failed to replace env in config: ${NPM_TOKEN}</summary>
 
```shell
error An unexpected error occurred: "Failed to replace env in config: ${NPM_TOKEN}".
```

**Solution**

Type in the command line while in the project folder:

```shell
rm -f ./.npmrc
```

</details>

<details>
  <summary>Adding the dependency to the workspace</summary>

```shell
error Running this command will add the dependency to the workspace root rather than the workspace itself, which might not be what you want - if you really meant it, make it explicit by running this command again with the -W flag (or --ignore-workspace-root-check).
```

**Solution**

Type in the command line while in the project folder:

```shell
yarn add @rarible/sdk -D -W
```

</details>

<details>
  <summary>darwin-arm64.tar.gz downloading error </summary>

```shell
...
node-pre-gyp info it worked if it ends with ok
node-pre-gyp info using node-pre-gyp@0.13.0
node-pre-gyp info using node@16.13.1 | darwin | arm64
node-pre-gyp WARN Using request for node-pre-gyp https download
...
node-pre-gyp http GET https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
node-pre-gyp http 404 https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
node-pre-gyp ERR! install error
node-pre-gyp ERR! stack Error: 404 status code downloading tarball https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
...
```

**Solution**

Type in the command line while in the project folder:

```shell
sudo npm install -g n
sudo n 14.17.6
```

</details>

## Suggestions

You are welcome to [suggest features](https://github.com/rarible/protocol/discussions) and [report bugs found](https://github.com/rarible/protocol/issues)!

## Contributing

The codebase is maintained using the "contributor workflow" where everyone without exception contributes patch proposals using "pull requests" (PRs). This facilitates social contribution, easy testing, and peer review.

See more information on [CONTRIBUTING.md](https://github.com/rarible/protocol/blob/main/CONTRIBUTING.md).

## License

Rarible Multichain SDK is available under the [MIT License](LICENSE).

### Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*
