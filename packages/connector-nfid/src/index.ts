import type { Observable } from "rxjs"

import { first, mergeMap, startWith } from "rxjs/operators"
import type {
	ConnectionState,
	EthereumProviderConnectionResult, Maybe,
} from "@rarible/connector"
import {
	connectToWeb3,
} from "@rarible/connector"
import {
	cache,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	getStateConnecting,
} from "@rarible/connector"
import { nfid } from "@nfid/embed"
import type { NFID } from "@nfid/embed"

export type NFIDConfig = {
	rpcUrl: string
	networkId: number
}

const PROVIDER_ID = "NFID" as const

export class NFIDConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, EthereumProviderConnectionResult> {

	private readonly instance: Observable<NFID>
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor() {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => {
				return connectToWeb3(instance.provider, { disconnect: () => instance.disconnect() })
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID }))
		)
	}

	private async _connect(): Promise<NFID> {
		await nfid.init()
		await nfid.login()
		return nfid
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
		const nfid = await this.instance.pipe(first()).toPromise()
		return nfid.isIframeInstantiated && nfid.isAuthenticated
	}
}