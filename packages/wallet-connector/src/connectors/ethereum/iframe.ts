import { combineLatest, defer, Observable } from "rxjs"
import { distinctUntilChanged, first, map, mergeMap, shareReplay, startWith } from "rxjs/operators"
import Web3 from "web3"
import type { IFrameEthereumProvider } from "@ledgerhq/iframe-provider"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache, promiseToObservable } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnected, getStateConnecting, getStateDisconnected } from "../../connection-state"
import { Blockchain } from "../../common/provider-wallet"
import type { EthereumProviderConnectionResult } from "./domain"

type IframeInstance = IFrameEthereumProvider

const PROVIDER_ID = "iframe" as const

export class IframeConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<IframeInstance>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor() {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(getConnect),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<IframeInstance> {
		const { IFrameEthereumProvider } = await import("@ledgerhq/iframe-provider")
		return new IFrameEthereumProvider()
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
		const web3 = new Web3((await this.instance.pipe(first()).toPromise()) as any)
		const accounts = await web3.eth.getAccounts()
		return accounts.length > 0
	}
}

function getConnect(instance: IframeInstance): Observable<ConnectionState<EthereumProviderConnectionResult>> {
	const web3 = new Web3(instance as any)

	return combineLatest([
		promiseToObservable(getAddress(instance, web3)),
		promiseToObservable(getChainId(instance, web3)),
	]).pipe(
		map(([address, chainId]) => {
			if (address) {
				const wallet: EthereumProviderConnectionResult = {
					blockchain: Blockchain.ETHEREUM,
					chainId,
					address,
					provider: web3,
				}
				return getStateConnected({ connection: wallet })
			} else {
				return getStateDisconnected()
			}
		}),
	)
}

async function getAddress(instance: any, web3: Web3): Promise<Observable<string | undefined>> {
	const initialAddress = (await web3.eth.getAccounts())?.[0]
	return new Observable<string | undefined>(subscriber => {
		function handler(accounts: string[]) {
			subscriber.next(accounts[0])
		}
		instance.on("accountsChanged", handler)
	}).pipe(startWith(initialAddress), distinctUntilChanged(), shareReplay(1))
}

async function getChainId(instance: any, web3: Web3): Promise<Observable<number>> {
	const networkId = await web3.eth.getChainId()
	return new Observable<number>(subscriber => {
		function handler(networkId: string) {
			subscriber.next(parseInt(networkId))
		}
		instance.on("chainChanged", handler)
	}).pipe(startWith(networkId), distinctUntilChanged(), shareReplay(1))
}