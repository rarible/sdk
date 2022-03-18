import { Observable } from "rxjs"
import { combineLatest } from "rxjs"
import { first, map, mergeMap, startWith, distinctUntilChanged } from "rxjs/operators"
import type {
	ConnectionState,
	Maybe,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache, getStateConnecting,
} from "@rarible/connector"
import { getStateConnected, getStateDisconnected } from "@rarible/connector"
import type { ConnectOpts, PhantomProvider, SolanaProviderConnectionResult } from "./domain"

type ConnectStatus = "connected" | "disconnected"

const PROVIDER_ID = "phantom" as const

export class PhantomConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, SolanaProviderConnectionResult> {
	private instance: Observable<PhantomProvider>
	private readonly connection: Observable<ConnectionState<SolanaProviderConnectionResult>>

	constructor(
		private readonly config?: ConnectOpts
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private async _connect(): Promise<PhantomProvider> {
		if ("solana" in window) {
			const anyWindow: any = window
			const provider = anyWindow.solana
			if (provider.isPhantom) {
				await provider.connect(this.config)
				return provider
			}
		}
		throw new Error("No solana provider found")
	}

	getConnectedStatus(provider: PhantomProvider): Observable<ConnectStatus> {
		return new Observable<ConnectStatus>(subscriber => {
			subscriber.next("connected")

			function connectHandler() {
				subscriber.next("connected")
			}

			function disconnectHandler() {
				subscriber.next("disconnected")
			}

			provider.on("connect", connectHandler)
			provider.on("disconnect", disconnectHandler)

			subscriber.add(() => {
				console.log("para param pam")
				provider.removeListener("connect", connectHandler)
				provider.removeListener("disconnect", disconnectHandler)
			})
		})
	}

	getAddress(provider: PhantomProvider): Observable<string> {
		return new Observable<string>(subscriber => {
			subscriber.next(provider.publicKey.toString())
			provider.on("accountChanged", async (publicKey: any /*PublicKey*/) => {
				if (publicKey) {
					subscriber.next(publicKey.toString())
				} else {
					await provider.connect()
					subscriber.next(provider.publicKey.toString())
				}
			})
		})
	}

	private toConnectState(provider: PhantomProvider): Observable<ConnectionState<SolanaProviderConnectionResult>> {
		return combineLatest([
			this.getAddress(provider),
			this.getConnectedStatus(provider),
		]).pipe(
			distinctUntilChanged((c1, c2) => {
				return c1[0] === c2[0] && c1[1] === c2[1]
			}),
			map(([address, status]) => {
				if (status === "connected" && address) {
					const wallet: SolanaProviderConnectionResult = {
						address: address,
						publicKey: provider.publicKey,
						isConnected: provider.isConnected,
						signTransaction: provider.signTransaction,
						signAllTransactions: provider.signAllTransactions,
						signMessage: provider.signMessage,
						connect: provider.connect,
						disconnect: provider.disconnect,
						on: provider.on,
						removeListener: provider.removeListener,
						request: provider.request,
					}
					return getStateConnected({ connection: wallet })
				} else {
					return getStateDisconnected()
				}
			}),
		)
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
		const instance = await this.instance.pipe(first()).toPromise()
		return !!instance.isConnected
	}
}