import { combineLatest, Observable } from "rxjs"
import { distinctUntilChanged, first, map, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState, Maybe } from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache,
	getStateConnected,
	getStateConnecting,
	getStateDisconnected,
} from "@rarible/connector"
import type { ISolanaProviderConnectionResult } from "@rarible/connector-helper"
import Solflare from "@solflare-wallet/sdk"
import type { ConnectOpts, SolflareProvider } from "./domain"

export * from "./domain"

type ConnectStatus = "connected" | "disconnected"

const PROVIDER_ID = "solflare" as const

export class SolflareConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, ISolanaProviderConnectionResult> {
	private instance!: Observable<SolflareProvider>
	private connection!: Observable<ConnectionState<ISolanaProviderConnectionResult>>

	constructor(
		private readonly config?: ConnectOpts
	) {
		super()
		this.init()
	}

	private init() {
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => {
				const disconnected = () => {
					return instance.disconnect()
				}
				return this.toConnectState(instance, disconnected)
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private async _connect(): Promise<SolflareProvider> {
		const wallet = new Solflare(this.config)
		await wallet.connect()
		return wallet
	}

	getConnectedStatus(provider: SolflareProvider): Observable<ConnectStatus> {
		return new Observable<ConnectStatus>(subscriber => {
			subscriber.next("connected")

			const connectHandler = () => {
				subscriber.next("connected")
			}

			const disconnectHandler = () => {
				this.init()
				subscriber.next("disconnected")
			}

			provider.on("connect", connectHandler)
			provider.on("disconnect", disconnectHandler)

			subscriber.add(() => {
				provider.removeListener("connect", connectHandler)
				provider.removeListener("disconnect", disconnectHandler)
			})
		})
	}

	getAddress(provider: SolflareProvider): Observable<string> {
		return new Observable<string>(subscriber => {
			subscriber.next(provider.publicKey?.toString())
			/*provider.on("accountChanged", async (publicKey: PublicKey) => {
				if (publicKey) {
					subscriber.next(publicKey.toString())
				} else {
					await provider.connect()
					subscriber.next(provider.publicKey?.toString())
				}
			})*/
		})
	}

	private toConnectState(
		provider: SolflareProvider,
		disconnect?: () => Promise<void>
	): Observable<ConnectionState<ISolanaProviderConnectionResult>> {
		return combineLatest([
			this.getAddress(provider),
			this.getConnectedStatus(provider),
		]).pipe(
			distinctUntilChanged((c1, c2) => {
				return c1[0] === c2[0] && c1[1] === c2[1]
			}),
			map(([address, status]) => {
				if (status === "connected" && address && provider.publicKey) {
					const wallet: ISolanaProviderConnectionResult = {
						address: address,
						publicKey: provider.publicKey,
						signTransaction: provider.signTransaction.bind(provider),
						signAllTransactions: provider.signAllTransactions.bind(provider),
						signMessage: provider.signMessage.bind(provider),
					}
					return getStateConnected({
						connection: wallet,
						disconnect,
					})
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
		return !!instance?.isConnected
	}
}