import type { Observable } from "rxjs"
import { mergeMap, startWith } from "rxjs/operators"
import type { IFrameEthereumProvider } from "@ledgerhq/iframe-provider"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting } from "../../connection-state"
import type { EthereumProviderConnectionResult } from "./domain"
import { connectToWeb3 } from "./common/web3connection"

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
