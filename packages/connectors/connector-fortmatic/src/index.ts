import type { Observable } from "rxjs"
import type { WidgetMode } from "fortmatic/dist/cjs/src/core/sdk"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { QueryParameters } from "fortmatic/dist/cjs/src/util/query-params"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting } from "@rarible/connector"

type FM = WidgetMode

export type FortmaticConfig = {
	apiKey: string,
	ethNetwork?: QueryParameters["ETH_NETWORK"]
}

const PROVIDER_ID = "fortmatic" as const

export class FortmaticConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<FM>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: FortmaticConfig,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => {
				const disconnect = () => instance.user.logout()
				return connectToWeb3(instance.getProvider(), { disconnect })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private async _connect(): Promise<FM> {
		const { default: Fortmatic } = await import("fortmatic")
		return new Fortmatic(this.config.apiKey)
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
		return !!(await sdk?.user.isLoggedIn())
	}
}
