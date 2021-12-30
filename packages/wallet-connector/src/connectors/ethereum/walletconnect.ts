import { combineLatest, defer, Observable } from "rxjs"
import { distinctUntilChanged, first, map, mergeMap, shareReplay, startWith } from "rxjs/operators"
import type WalletConnectProvider from "@walletconnect/web3-provider"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache, noop, promiseToObservable } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting, getStateDisconnected, getStateConnected } from "../../connection-state"
import { Blockchain } from "../../common/provider-wallet"
import type { EthereumProviderConnectionResult } from "./domain"

export type WalletConnectConfig = {
	infuraId: string
	rpcMap: Record<number, string>
	networkId: number
}

type ConnectStatus = "connected" | "disconnected"

const PROVIDER_ID = "walletconnect" as const

export class WalletConnectConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<WalletConnectProvider>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: WalletConnectConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(getConnect),
			startWith(getStateConnecting({ providerId: PROVIDER_ID }))
		))
	}

	private async _connect(): Promise<WalletConnectProvider> {
		const { default: WalletConnectProvider } = await import("@walletconnect/web3-provider")
		const provider = new WalletConnectProvider(this.config)
		await provider.enable()
		return provider
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return Promise.resolve(PROVIDER_ID)
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.instance.pipe(first()).toPromise()
		return sdk.connected
	}
}

function getConnect(provider: WalletConnectProvider): Observable<ConnectionState<EthereumProviderConnectionResult>> {
	let disconnectResolve: () => void
	const disconnectPromise = new Promise<void>((resolve) => disconnectResolve = resolve)

	const disconnect = () => {
		disconnectResolve()
		provider.disconnect().then().catch(noop)
	}

	return combineLatest([
		promiseToObservable(getAddress(provider, disconnectPromise)),
		promiseToObservable(getChainId(provider, disconnectPromise)),
		promiseToObservable(getConnectedStatus(provider)),
	]).pipe(
		map(([address, chainId, status]) => {
			if (status === "connected" && address) {
				const wallet: EthereumProviderConnectionResult = {
					blockchain: Blockchain.ETHEREUM,
					chainId,
					address,
					provider,
					disconnect,
				}
				return getStateConnected({ connection: wallet })
			} else {
				return getStateDisconnected()
			}
		}),
	)
}

async function getAddress(
	provider: WalletConnectProvider,
	disconnectPromise: Promise<void>
): Promise<Observable<string | undefined>> {
	const initialAddress = provider.accounts[0]
	return new Observable<string | undefined>(subscriber => {
		function handler(addresses: string[]) {
			const [address] = addresses
			subscriber.next(address)
		}
		provider.on("accountsChanged", handler)
		disconnectPromise.then(() => {
			provider.removeListener("accountsChanged", handler)
		})
	}).pipe(startWith(initialAddress), distinctUntilChanged(), shareReplay(1))
}

async function getChainId(
	provider: WalletConnectProvider,
	disconnectPromise: Promise<void>
): Promise<Observable<number>> {
	const networkId = provider.chainId
	return new Observable<number>(subscriber => {
		function handler(networkId: number) {
			subscriber.next(networkId)
		}
		provider.on("chainChanged", handler)
		disconnectPromise.then(() => {
			provider.removeListener("chainChanged", handler)
		})
	}).pipe(startWith(networkId), distinctUntilChanged(), shareReplay(1))
}

async function getConnectedStatus(provider: WalletConnectProvider): Promise<Observable<ConnectStatus>> {
	return new Observable<ConnectStatus>(subscriber => {
		function handler() {
			subscriber.next("disconnected")
			provider.removeListener("disconnected", handler)
		}
		provider.on("disconnected", handler)
	}).pipe(startWith("connected" as ConnectStatus), distinctUntilChanged())
}