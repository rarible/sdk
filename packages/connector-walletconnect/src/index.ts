import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type WalletConnectProvider from "@walletconnect/web3-provider"
import type { IWalletConnectProviderOptions } from "@walletconnect/types"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting } from "@rarible/connector"


const PROVIDER_ID = "walletconnect" as const

export class WalletConnectConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {
	private readonly instance: Observable<WalletConnectProvider>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor(
		private readonly config: IWalletConnectProviderOptions
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

	private async _connect(): Promise<WalletConnectProvider> {
		const { default: WalletConnectProvider } = await import("@walletconnect/web3-provider")
		const provider = new WalletConnectProvider(this.config)
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
		const sdk = await this.instance.pipe(first()).toPromise()
		return !!sdk?.connected
	}
}
