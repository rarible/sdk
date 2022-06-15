### Initialising wallet for SDK

#### Ethereum/Polygon

```typescript
import Web3ProviderEngine from "web3-provider-engine"
import Wallet from "ethereumjs-wallet"
import { TestSubprovider } from "@rarible/test-provider"
// @ts-ignore
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { ethers } from "ethers"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRaribleSdk } from "@rarible/sdk"

const privateKey = "YOUR_ETHEREUM_PRIVATE_KEY"

// init with ethers
const raribleEthers = new ethers.providers.JsonRpcProvider(process.env["ETHEREUM_RPC_URL"])
const raribleProvider = new EthersEthereum(new ethers.Wallet(privateKey, raribleEthers))
const raribleWallet = new EthereumWallet(raribleProvider)
const raribleSdk = createRaribleSdk(raribleWallet, "staging")

// init with web3
const provider = new Web3ProviderEngine({ pollingInterval: 100 })
const sansPrefixedPrivateKey = privateKey.startsWith("0x") ? privateKey.substring(2) : privateKey
const wallet = new Wallet(Buffer.from(sansPrefixedPrivateKey, "hex"))
provider.addProvider(new TestSubprovider(wallet, { networkId: config.networkId, chainId: config.networkId }))
provider.addProvider(new RpcSubprovider({ rpcUrl: config.rpcUrl }))
provider.start()
const web3 = new Web3(provider)
const web3Ethereum = new Web3Ethereum({ web3 })
const raribleSdkWallet = new EthereumWallet(web3Ethereum)
const raribleSdk = createRaribleSdk(raribleSdkWallet, "dev")
```

#### Solana
```typescript
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/sdk"

const privateKey = "YOUR_SOLANA_PRIVATE_KEY"

const keypairWallet = SolanaKeypairWallet.createFrom(privateKey)
const raribleSdkWallet = new SolanaWallet(keypairWallet)
const raribleSdk = createRaribleSdk(raribleSdkWallet, "dev")
```

#### Tezos
```typescript
import { TezosWallet } from "@rarible/sdk-wallet"
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk"

const walletEdsk = "edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6" +
"H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
const provider = in_memory_provider(
    walletEdsk,
    "https://test-tezos-node.rarible.org"
)
const wallet = new TezosWallet(provider)
const sdk = createRaribleSdk(wallet, "dev")
```
#### Flow
