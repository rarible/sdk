// @ts-ignore
import Web3ProviderEngine from "web3-provider-engine"
import Wallet from "ethereumjs-wallet"
import { TestSubprovider } from "@rarible/test-provider"
// @ts-ignore
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import { randomWord } from "@rarible/types"

export function createE2eWallet(pk: string = randomWord()): Wallet {
	return new Wallet(Buffer.from(fixPK(pk), "hex"))
}

class Web3ProviderEngineSync extends Web3ProviderEngine {
	//@ts-ignore
	constructor(opts) {
		super(opts)
	}
	//@ts-ignore
	send(payload, cb) {
		//@ts-ignore
		this.sendAsync(payload, cb)
	}
}

export type E2EProviderConfig = {
	networkId: number
	chainId: number
	rpcUrl: string
	pollingInterval: number
	customEngine?: Web3ProviderEngine
}

export class E2EProvider {
	readonly provider: Web3ProviderEngineSync
	readonly config: E2EProviderConfig
	readonly wallet: Wallet

	constructor(
		pk: string = randomWord(),
		configOverride: Partial<E2EProviderConfig> = {},
	) {
		this.config = this.createConfig(configOverride)
		this.wallet = createE2eWallet(pk)
		const provider = this.createEngine(this.config.pollingInterval)
		provider.addProvider(this.createWalletProvider())
		provider.addProvider(this.createRpcProvider())

		this.provider = provider
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
		return new Web3ProviderEngineSync({
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
		provider: provider.provider as any,
		wallet: provider.wallet,
	}
}
