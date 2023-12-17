import { combineLatest, defer, Observable } from "rxjs"
import { distinctUntilChanged, first, map, mergeMap, startWith } from "rxjs/operators"
import type { ImxEnv } from "@rarible/immutable-wallet"
import { ImxWallet } from "@rarible/immutable-wallet"
import type { ConnectionState, Maybe } from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache,
	getStateConnected,
	getStateConnecting,
	getStateDisconnected,
} from "@rarible/connector"
import type { IImmutableXProviderConnectionResult } from "@rarible/connector-helper"

export type WalletConfig = {
	env: ImxEnv
}

type ConnectStatus = "connected" | "disconnected"

const PROVIDER_ID = "immutablex" as const

export class ImmutableXLinkConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, IImmutableXProviderConnectionResult> {
	private readonly instance: Observable<{ wallet: ImxWallet }>
	private readonly connection: Observable<ConnectionState<IImmutableXProviderConnectionResult>>

	constructor(
		private readonly config: WalletConfig,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance.wallet)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<{ wallet: ImxWallet }> {
		const wallet = new ImxWallet(this.config.env)
		if (wallet.getConnectionData().status !== "connected") {
			await wallet.connect()
		}
		return { wallet }
	}

	getId(): string {
		return PROVIDER_ID
	}

	getAddress(wallet: ImxWallet): Observable<string> {
		return new Observable<string>(subscriber => {
			subscriber.next(wallet.getConnectionData().address)

			// wallet.link.syncState({}).then((stream) => {
			// 	stream.subscribe((event) => {
			// 		console.log(event)
			// 		if (event.eventType === SyncStateEventTypes.WALLET_CHANGE) {
			// 			// if ((event as ActiveWalletChangeSyncStateEvent).connectedWalletAddress !== null) {
			// 			// 	subscriber.next((event as ActiveWalletChangeSyncStateEvent).connectedWalletAddres)
			// 			// }
			// 		}
			// 	})
			// })
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getConnectedStatus(_wallet: ImxWallet): Observable<ConnectStatus> {
		return new Observable<ConnectStatus>(subscriber => {
			subscriber.next("connected")

			// wallet.link.syncState({}).then((stream) => {
			// 	stream.subscribe((event) => {
			// 		if (event.eventType === SyncStateEventTypes.DISCONNECT) {
			// 			subscriber.next("disconnected")
			// 		}
			// 	})
			// })
		})
	}

	private toConnectState(wallet: ImxWallet): Observable<ConnectionState<IImmutableXProviderConnectionResult>> {
		return combineLatest([
			this.getAddress(wallet),
			this.getConnectedStatus(wallet),
		]).pipe(
			distinctUntilChanged((c1, c2) => {
				return c1[0] === c2[0] && c1[1] === c2[1]
			}),
			map(([address, status]) => {
				if (status === "connected" && address) {
					const connection: IImmutableXProviderConnectionResult = {
						address: address,
						wallet: wallet,
					}
					return getStateConnected({
						connection,
						disconnect: async () => await wallet.disconnect(),
					})
				} else {
					return getStateDisconnected()
				}
			}),
		)
	}

	getConnection() {
		return this.connection
	}

	getOption() {
		return PROVIDER_ID
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		return (await this.instance.pipe(first()).toPromise())?.wallet.getConnectionData().status === "connected"
	}
}
