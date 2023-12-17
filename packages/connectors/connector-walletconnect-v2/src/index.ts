import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting } from "@rarible/connector"
import type {
	EthereumProvider,
	EthereumProviderOptions,
} from "@walletconnect/ethereum-provider/dist/types/EthereumProvider"

const PROVIDER_ID = "walletconnect_v2" as const
export class WalletConnectConnectionProviderV2 extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<EthereumProvider>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: EthereumProviderOptions
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => {
				const disconnect = () => instance.disconnect()
				return connectToWeb3(instance, { disconnect })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID }))
		)
	}

	private async _connect(): Promise<EthereumProvider> {
		const { EthereumProvider } = await import("@walletconnect/ethereum-provider")
		const provider = await EthereumProvider.init(this.config)
		await provider.enable()
		return provider
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection() {
		return this.connection
	}

	getOption() {
		return PROVIDER_ID
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.instance.pipe(first()).toPromise()
		return !!sdk?.connected
	}
}
