import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { default as Portis, INetwork, IOptions } from "@portis/web3"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting, noop } from "@rarible/connector"

type PortisInstance = Portis
type PortisNetwork = string | INetwork

export type PortisConfig = {
	appId: string
	network: PortisNetwork
} & IOptions

const PROVIDER_ID = "portis" as const

export class PortisConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<PortisInstance>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: PortisConfig,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => {
				const disconnect = () => instance.logout().then(noop)
				return connectToWeb3(instance.provider, { disconnect })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private async _connect(): Promise<PortisInstance> {
		const { default: Portis } = await import("@portis/web3")
		return new Portis(this.config.appId, this.config.network)
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
		return true === (await sdk?.isLoggedIn())?.result
	}
}
