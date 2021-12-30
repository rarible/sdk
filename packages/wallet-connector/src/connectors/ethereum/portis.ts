import type { Observable } from "rxjs"
import { defer } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { default as Portis, INetwork } from "@portis/web3"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache, noop } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting } from "../../connection-state"
import { connectToWeb3, getJsonRpcWalletInfoProvider } from "./common/web3connection"
import type { EthereumProviderConnectionResult } from "./domain"

type PortisInstance = Portis
type PortisNetwork = string | INetwork

export type PortisConfig = {
	apiKey: string
	network: PortisNetwork
}

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
		this.connection = defer(() => this.instance.pipe(
			mergeMap(instance => {
				const web3like = instance.provider
				return connectToWeb3(
					getJsonRpcWalletInfoProvider(web3like),
					instance,
					web3like,
					{
						disconnect: () => instance.logout().then(noop).catch(noop),
					}
				)
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<PortisInstance> {
		const { default: Portis } = await import("@portis/web3")
		return new Portis(this.config.apiKey, this.config.network)
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
		return true === (await sdk.isLoggedIn()).result
	}
}
