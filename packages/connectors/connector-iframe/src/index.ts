import type { Observable } from "rxjs"
import { mergeMap, startWith } from "rxjs/operators"
import type { IFrameEthereumProvider } from "@ledgerhq/iframe-provider"
import type {
	Maybe,
	ConnectionState,
	EthereumProviderConnectionResult } from "@rarible/connector"
import {
	cache,
	connectToWeb3,
	AbstractConnectionProvider,
	getStateConnecting,
} from "@rarible/connector"

type IframeInstance = IFrameEthereumProvider

const PROVIDER_ID = "iframe" as const

export class IframeConnectionProvider
	extends AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {

	private readonly instance: Observable<IframeInstance>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor() {
		super()
		this.instance = cache(() => connect())
		this.connection = this.instance.pipe(
			mergeMap(instance => connectToWeb3(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
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
		return true
	}

	async isConnected(): Promise<boolean> {
		return true
	}
}

async function connect(): Promise<IframeInstance> {
	const { IFrameEthereumProvider } = await import("@ledgerhq/iframe-provider")
	return new IFrameEthereumProvider()
}
