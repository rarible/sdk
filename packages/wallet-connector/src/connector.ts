import type { Observable } from "rxjs"
import { BehaviorSubject, concat, defer, of } from "rxjs"
import { catchError, distinctUntilChanged, first, map, mergeMap, shareReplay, tap } from "rxjs/operators"
import type { ConnectionProvider } from "./provider"
import type { ConnectionState } from "./connection-state"
import { getStateConnecting, STATE_DISCONNECTED, STATE_INITIALIZING } from "./connection-state"

export type ProviderOption<Option, Connection> = {
	provider: ConnectionProvider<Option, Connection>
	option: Option
}

export interface IConnector<Option, Connection> {
	/**
	 * Get all available connection options (Metamask, Fortmatic, Blocto, Temple etc)
	 */
	getOptions(): Promise<ProviderOption<Option, Connection>[]>
	/**
	 * Connect using specific option
	 */
	connect(option: ProviderOption<Option, Connection>): void
	/**
	 * Subscribe to this observable to get current connection state
	 */
	connection: Observable<ConnectionState<Connection>>
}

/**
 * This component is used to save/load last connected provider
 */
export interface IConnectorStateProvider {
	getValue(): Promise<string | undefined>

	setValue(value: string | undefined): Promise<void>
}

export class Connector<Option, Connection> implements IConnector<Option, Connection> {
	private readonly provider = new BehaviorSubject<ConnectionProvider<Option, Connection> | undefined>(undefined)
	public connection!: Observable<ConnectionState<Connection>>

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
		private readonly stateProvider?: IConnectorStateProvider,
	) {
		this.add = this.add.bind(this)
		this.connect = this.connect.bind(this)

		this.connection = concat(
			of(STATE_INITIALIZING),
			defer(() => this.checkAutoConnect()),
			this.provider.pipe(
				distinctUntilChanged(),
				mergeMap(provider => {
					if (provider) {
						return provider.getConnection().pipe(
							catchError((err) => {
								console.log("Connecting error: " + err)
								return of(STATE_DISCONNECTED)
							})
						)
					} else {
						return of(STATE_DISCONNECTED)
					}
				}),
			),
		).pipe(
			distinctUntilChanged((c1, c2) => {
				if (c1 === c2) return true
				if (c1.status === "connected" && c2.status === "connected") {
					return c1.connection === c2.connection
				} else if (c1.status === "connecting" && c2.status === "connecting") {
					return c1.providerId === c2.providerId
				}
				return c1.status === c2.status
			}),
			shareReplay(1),
			map(conn => {
				if (conn.status === "connected") {
					return {
						...conn,
						disconnect: async () => {
							if (conn.disconnect !== undefined) {
								try {
									await conn.disconnect()
								} catch (_) {

								}
							}
							this.provider.next(undefined)
						},
					}
				} else {
					return conn
				}
			}),
			tap(async conn => {
				if (conn.status === "disconnected") {
					this.provider.next(undefined)
					const current = await this.stateProvider?.getValue()
					if (current !== undefined) {
						console.log("setting undefined")
						this.stateProvider?.setValue(undefined)
					}
				}
			}),
		)
	}

	/**
	 * Push {@link provider} to connectors list
	 * @param provider connection provider
	 */
	add<NewOption, NewConnection>(provider: ConnectionProvider<Option | NewOption, Connection | NewConnection>) {
		return new Connector([...this.providers, provider], this.stateProvider)
	}

	/**
	 * Create connector instance and push {@link provider} to connectors list
	 * @param provider connection provider
	 * @param stateProvider provider used to save/load last connected provider
	 */
	static create<Option, Connection>(
		provider: ConnectionProvider<Option, Connection>,
		stateProvider?: IConnectorStateProvider,
	): Connector<Option, Connection> {
		return new Connector([provider], stateProvider)
	}

	private async checkAutoConnect(): Promise<ConnectionState<Connection>> {
		console.log("Connector initialized. Checking auto-(re)connect")
		try {
			const promises = this.providers.map(it => ({ provider: it, autoConnected: it.isAutoConnected() }))
			for (const { provider, autoConnected } of promises) {
				const value = await autoConnected
				if (value) {
					console.log(`Provider ${provider.getId()} is auto-connected`)
					this.provider.next(provider)
					this.stateProvider?.setValue(provider.getId())
					return getStateConnecting({ providerId: provider.getId() })
				}
			}
			const selected = await this.stateProvider?.getValue()
			if (selected !== undefined) {
				for (const provider of this.providers) {
					if (selected === provider.getId()) {
						console.log(`Previously connected provider found: ${selected}. checking if is connected`)
						if (await provider.isConnected()) {
							console.log(`Provider ${selected} is connected`)
							this.provider.next(provider)
							return getStateConnecting({ providerId: provider.getId() })
						} else {
							console.log(`Provider ${selected} is not connected`)
							this.stateProvider?.setValue(undefined)
							return STATE_DISCONNECTED
						}
					}
				}
			}
		} catch (e) {
			console.log("Autoconnect failed: " + e)
		}
		return STATE_DISCONNECTED
	}

	public async getOptions(): Promise<ProviderOption<Option, Connection>[]> {
		const result: ProviderOption<Option, Connection>[] = []
		for (const pair of this.providers.map(it => ({ provider: it, option: it.getOption() }))) {
			const { provider, option } = pair
			const opt = await option
			if (opt) {
				result.push({ provider, option: opt })
			}
		}
		return result
	}

	async connect(option: ProviderOption<Option, Connection>): Promise<void> {
		const connected = this.provider.value
		const connectionState = await this.connection.pipe(first()).toPromise()
		if (connected !== undefined && connectionState.status === "connected") {
			throw new Error(`Provider ${JSON.stringify(connected)} already connected`)
		}

		console.log(`Selected ${option.provider.getId()} provider`)
		this.provider.next(option.provider)
		this.stateProvider?.setValue(option.provider.getId())
	}
}
