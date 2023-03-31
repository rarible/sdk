import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type {
	ConnectionState,
	EthereumProviderConnectionResult, Maybe,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache, connectToWeb3, getStateConnecting,
} from "@rarible/connector"

export type MEWConfig = {
	rpcUrl: string
	networkId: number
}

type MewInstance = any

const PROVIDER_ID = "mew" as const

export class MEWConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<MewInstance>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: MEWConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => {
				const disconnect = () => instance.disconnect()
				return connectToWeb3(instance.makeWeb3Provider(), { disconnect })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private async _connect(): Promise<MewInstance> {
		const { default: MEWConnect } = await import("@myetherwallet/mewconnect-web-client")
		const provider = new MEWConnect.Provider({
			chainId: this.config.networkId,
			rpcUrl: this.config.rpcUrl,
			noUrlCheck: true,
			windowClosedError: true,
		})
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
		const instance = await this.instance.pipe(first()).toPromise()
		return !!instance?.Provider?.isConnected
	}
}