import type { Observable } from "rxjs"
import { defer } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { default as Torus } from "@toruslabs/torus-embed"
import type { TorusParams } from "@toruslabs/torus-embed/dist/types/interfaces"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache, noop } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting } from "../../connection-state"
import { connectToWeb3, getJsonRpcWalletInfoProvider } from "./common/web3connection"
import type { EthereumProviderConnectionResult } from "./domain"

export type TorusConfig = TorusParams

const PROVIDER_ID = "torus" as const

export class TorusConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<Torus>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: TorusConfig
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
						disconnect: () => instance.cleanUp().catch(noop),
					}
				)
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<Torus> {
		const { default: Torus } = await import("@toruslabs/torus-embed")
		const torus = new Torus()
		await torus.init(this.config)
		await torus.login()
		return torus
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
		return sdk.isInitialized && sdk.isLoggedIn
	}
}
