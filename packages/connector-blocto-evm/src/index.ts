import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting } from "@rarible/connector"
import type { BloctoConnector } from "@blocto/blocto-connector"

const PROVIDER_ID = "blocto_evm" as const

export class BloctoEVMConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<BloctoConnector>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: { chainId: number, rpc: string }
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => {
				const disconnect = async () => instance.deactivate()
				return connectToWeb3(instance.blocto, { disconnect })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID }))
		)
	}

	private async _connect(): Promise<BloctoConnector> {
		const { BloctoConnector } = await import("@blocto/blocto-connector")
		const connector = new BloctoConnector(this.config)
		await connector.activate()
		return connector
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
		return sdk.blocto.connected
	}
}
