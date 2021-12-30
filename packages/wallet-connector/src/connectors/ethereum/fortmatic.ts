import type { Observable } from "rxjs"
import { defer } from "rxjs"
import type { WidgetMode } from "fortmatic/dist/cjs/src/core/sdk"
import { first, mergeMap, startWith } from "rxjs/operators"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache, noop } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting } from "../../connection-state"
import type { EthereumProviderConnectionResult } from "./domain"
import { connectToWeb3, getJsonRpcWalletInfoProvider } from "./common/web3connection"

type FM = WidgetMode

export type FortmaticConfig = {
	apiKey: string
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
		this.connection = defer(() => this.instance.pipe(
			mergeMap(instance => {
				const web3like = instance.getProvider()
				return connectToWeb3(
					getJsonRpcWalletInfoProvider(web3like),
					instance,
					web3like,
					{
						disconnect: () => instance.user.logout().then(noop).catch(noop),
					}
				)
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<FM> {
		const { default: Fortmatic } = await import("fortmatic")
		let p = new Fortmatic(this.config.apiKey)
		console.log(await p.user.getUser())
		return p
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
		return await sdk.user.isLoggedIn()
	}
}
