import type { Fcl } from "@rarible/fcl-types"
import type { Observable } from "rxjs"
import { defer } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type {
	ConnectionState, Maybe,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache, getStateConnected,
	getStateConnecting,
	getStateDisconnected,
} from "@rarible/connector"
import type { FlowProviderConnectionResult } from "./domain"

export type FclConfig = {
	accessNode: string,
	walletDiscovery: string,
	network: string,
	applicationTitle: string,
	applicationIcon: string
}

const PROVIDER_ID = "fcl" as const

export class FclConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, FlowProviderConnectionResult> {

	private readonly instance: Observable<Fcl>
	private readonly connection: Observable<ConnectionState<FlowProviderConnectionResult>>

	constructor(
		private readonly config: FclConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private toConnectState(fcl: Fcl): Observable<ConnectionState<FlowProviderConnectionResult>> {
		const disconnect = () => fcl.unauthenticate()
		return defer(() => fcl.currentUser().authenticate()).pipe(
			map(auth => {
				const address = auth.addr
				if (!address) {
					return getStateDisconnected()
				}
				return getStateConnected<FlowProviderConnectionResult>({
					connection: { fcl, address },
					disconnect,
				})
			}),
		)
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection(): Observable<ConnectionState<FlowProviderConnectionResult>> {
		return this.connection
	}

	private async _connect(): Promise<Fcl> {
		const fcl: Fcl = await import("@onflow/fcl")
		fcl
			.config()
			.put("accessNode.api", this.config.accessNode)
			.put("discovery.wallet", this.config.walletDiscovery)
			.put("env", this.config.network)
			.put("app.detail.title", this.config.applicationTitle)
			.put("app.detail.icon", this.config.applicationIcon)

		return fcl
	}

	getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return Promise.resolve(PROVIDER_ID)
	}

	isAutoConnected() {
		return Promise.resolve(false)
	}

	async isConnected(): Promise<boolean> {
		const instance = await this.instance.pipe(first()).toPromise()
		return !!instance?.currentUser()
	}
}
