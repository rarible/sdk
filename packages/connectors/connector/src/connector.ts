import type { Observable } from "rxjs"
import { BehaviorSubject, concat, defer, NEVER, of } from "rxjs"
import { catchError, distinctUntilChanged, first, map, shareReplay, switchMap, tap } from "rxjs/operators"
import type { RemoteLogger } from "@rarible/logger/build"
import { getStringifiedData } from "@rarible/sdk-common"
import type { ConnectionProvider } from "./provider"
import type { ConnectionState } from "./connection-state"
import { getStateConnecting, getStateDisconnected, STATE_INITIALIZING } from "./connection-state"
import { createLogger, getErrorLogLevel, LogLevelConnector } from "./common/logger"


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

	/**
   * Get added providers
   */
	getProviders(): ConnectionProvider<Option, Connection>[]

	/**
   * Get connected provider
   */
	getCurrentProvider(): ConnectionProvider<Option, Connection> | undefined
}

/**
 * This component is used to save/load last connected provider
 */
export interface IConnectorStateProvider {
	getValue(): Promise<string | undefined>

	setValue(value: string | undefined): Promise<void>
}

export class DefaultConnectionStateProvider implements IConnectorStateProvider {
	constructor(private readonly key: string) {
	}

	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem(this.key)
		return value !== null ? value : undefined
	}

	async setValue(value: string | undefined): Promise<void> {
		if (value === undefined) {
			localStorage.removeItem(this.key)
		} else {
			localStorage.setItem(this.key, value)
		}
	}
}

export class Connector<Option, Connection> implements IConnector<Option, Connection> {
	static pageUnloading: boolean | undefined
	private readonly provider = new BehaviorSubject<ConnectionProvider<Option, Connection> | undefined>(undefined)
	public connection: Observable<ConnectionState<Connection>>
	private logger: RemoteLogger

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
		private readonly stateProvider?: IConnectorStateProvider,
	) {
		Connector.initPageUnloadProtection()

		this.add = this.add.bind(this)
		this.connect = this.connect.bind(this)

		this.logger = createLogger()

		this.connection = concat(
			of(STATE_INITIALIZING),
			defer(() => this.checkAutoConnect()),
			this.provider.pipe(
				distinctUntilChanged(),
				switchMap(provider => {
					if (provider) {
						return concat(provider.getConnection(), NEVER).pipe(
							catchError(error => {
								return concat(of(getStateDisconnected({ error })), NEVER)
							}),
							map(res => {
								if (res.status === "disconnected") {
									const option = provider.getOption()
									this.logger.raw({
										level: getErrorLogLevel(res.error, provider.getId()),
										method: "connect",
										message: res.error?.message,
										error: getStringifiedData(res.error),
										providerId: provider.getId(),
										providerOption: option || undefined,
										provider: getStringifiedData(provider),
									})
								}
								if (res.status === "connected") {
									const option = provider.getOption()
									this.logger.raw({
										level: LogLevelConnector.SUCCESS,
										method: "connect",
										message: "trace of connect",
										providerId: provider?.getId(),
										providerOption: option || undefined,
									})
								}
								return res
							})
						)
					} else {
						return concat(of(getStateDisconnected()), NEVER)
					}
				}),
			),
		).pipe(
			distinctUntilChanged((c1, c2) => {
				if (Connector.pageUnloading) return true
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
								} catch (e) {
									console.warn("caught on disconnect", e)
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
				if (conn.status === "disconnected" && !Connector.pageUnloading) {
					this.provider.next(undefined)
					const current = await this.stateProvider?.getValue()
					if (current !== undefined) {
						this.stateProvider?.setValue(undefined)
					}
				}
			}),
		)
	}

	getProviders(): ConnectionProvider<Option, Connection>[] {
		return this.providers
	}

	getCurrentProvider(): ConnectionProvider<Option, Connection> | undefined {
		return this.provider.getValue()
	}

	/**
	 * Add flag when page unload to avoid disconnect events from connectors
	 */
	static initPageUnloadProtection() {
		if (Connector.pageUnloading === undefined && typeof window !== "undefined") {
			window.addEventListener("beforeunload", function () {
				Connector.pageUnloading = true
			})
			Connector.pageUnloading = false
		}
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
		provider: ConnectionProvider<Option, Connection> | ConnectionProvider<Option, Connection>[],
		stateProvider?: IConnectorStateProvider,
	): Connector<Option, Connection> {
		if (Array.isArray(provider)) {
			return new Connector<Option, Connection>(provider, stateProvider)
		}
		return new Connector([provider], stateProvider)
	}

	private async checkAutoConnect(): Promise<ConnectionState<Connection>> {
		let currentProvider: ConnectionProvider<Option, Connection> | undefined
		try {
			const promises = this.providers.map(it => ({ provider: it, autoConnected: it.isAutoConnected() }))
			for (const { provider, autoConnected } of promises) {
				const value = await autoConnected
				if (value) {
					this.provider.next(provider)
					this.stateProvider?.setValue(provider.getId())
					return getStateConnecting({ providerId: provider.getId() })
				}
			}
			const selected = await this.stateProvider?.getValue()
			if (selected !== undefined) {
				for (const provider of this.providers) {
					currentProvider = provider
					if (selected === provider.getId()) {
						if (await provider.isConnected()) {
							this.provider.next(provider)
							return getStateConnecting({ providerId: provider.getId() })
						} else {
							this.stateProvider?.setValue(undefined)
							return getStateDisconnected()
						}
					}
				}
			}
		} catch (err: any) {
			this.logger.raw({
				level: getErrorLogLevel(err, currentProvider?.getId()),
				method: "checkAutoConnect",
				message: err?.message,
				error: getStringifiedData(err),
				providerId: currentProvider?.getId(),
				providerOption: await currentProvider?.getOption() || undefined,
				provider: getStringifiedData(currentProvider),
			})
			return getStateDisconnected({ error: err.toString() })
		}
		return getStateDisconnected()
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
		if (connected !== undefined && connectionState?.status === "connected") {
			throw new Error(`Provider ${JSON.stringify(connected)} already connected`)
		}
		this.provider.next(option.provider)
		this.stateProvider?.setValue(option.provider.getId())
	}
}
