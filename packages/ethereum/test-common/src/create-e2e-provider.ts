import Web3 from "web3"
import Web3ProviderEngine from "web3-provider-engine"
import Wallet from "ethereumjs-wallet"
import { TestSubprovider } from "@rarible/test-provider"
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import { randomWord } from "@rarible/types"
import type { provider as Web3Provider } from "web3-core"

export function createE2eWallet(pk: string = randomWord()): Wallet {
  return new Wallet(Buffer.from(fixPK(pk), "hex"))
}

export type E2EProviderConfig = {
  networkId: number
  chainId: number
  rpcUrl: string
  pollingInterval: number
  customEngine?: Web3ProviderEngine
}

export class E2EProvider {
  readonly provider: Web3ProviderEngine
  readonly config: E2EProviderConfig
  readonly wallet: Wallet
  readonly web3: Web3

  constructor(pk: string = randomWord(), configOverride: Partial<E2EProviderConfig> = {}) {
    this.config = this.createConfig(configOverride)
    this.wallet = createE2eWallet(pk)
    const provider = this.config.customEngine || this.createEngine(this.config.pollingInterval)
    provider.addProvider(this.createWalletProvider())
    provider.addProvider(this.createRpcProvider())
    this.provider = provider
    this.web3 = new Web3(provider as any)
  }

  private createConfig(override: Partial<E2EProviderConfig>) {
    const networkId = override.networkId || 300500
    return {
      networkId: networkId,
      chainId: override.chainId || networkId,
      rpcUrl: "https://dev-ethereum-node.rarible.com",
      pollingInterval: 3000,
      ...override,
    }
  }

  private createEngine(pollingInterval: number) {
    return new Web3ProviderEngine({
      pollingInterval,
    })
  }

  private createWalletProvider() {
    return new TestSubprovider(this.wallet, {
      networkId: this.config.networkId,
      chainId: this.config.chainId,
    })
  }

  private createRpcProvider() {
    return new RpcSubprovider({ rpcUrl: this.config.rpcUrl })
  }

  start = () => this.provider.start()

  stop = () => this.provider.stop()
}

function fixPK(pk: string) {
  return pk.startsWith("0x") ? pk.substring(2) : pk
}

export function createE2eProvider(pk?: string, config?: Partial<E2EProviderConfig>) {
  const provider = new E2EProvider(pk, config)

  beforeAll(() => provider.start())
  afterAll(() => provider.stop())

  return {
    provider: provider.provider as Web3Provider,
    wallet: provider.wallet,
  }
}
