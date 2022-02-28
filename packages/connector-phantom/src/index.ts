import type { Observable } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type {
	ConnectionState,
	Maybe,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache, getStateConnecting,
} from "@rarible/connector"
import { defer } from "rxjs"
import { getStateConnected, getStateDisconnected } from "@rarible/connector/src"
import type { ISolanaProvider, ISolanaProviderConnectionResult } from "./domain"

/*export type PhantomConfig = {
}*/


const PROVIDER_ID = "phantom" as const

export class PhantomConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, ISolanaProviderConnectionResult> {
	private readonly instance: Observable<ISolanaProvider>
	private readonly connection: Observable<ConnectionState<ISolanaProviderConnectionResult>>

	constructor(
		//private readonly config: PhantomConfig
	) {
		super()
		this.instance = cache(() => getInjectedProvider())
		this.connection = this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private toConnectState(provider: ISolanaProvider): Observable<ConnectionState<ISolanaProviderConnectionResult>> {
		const disconnect = () => provider.disconnect()
		return defer(() => provider.connect({ onlyIfTrusted: true })).pipe(
			map(publicKey => {
				console.log(publicKey)
				if (!publicKey) {
					return getStateDisconnected()
				}
				return getStateConnected<ISolanaProviderConnectionResult>({
					connection: provider,
					disconnect,
				})
			}),
		)
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
		return !!instance.isConnected
	}
}

function getInjectedProvider(): any | undefined {
	let provider: any = undefined
	const global: any = typeof window !== "undefined" ? window : undefined
	if (!global) {
		return provider
	} else if (global.solana) {
		provider = global.solana
	}
	return provider
}