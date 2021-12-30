import type { Fcl } from "@rarible/fcl-types"
import { Observable } from "rxjs"
import { defer } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnected, getStateConnecting, getStateDisconnected } from "../../connection-state"
import { Blockchain } from "../../common/provider-wallet"
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
		this.connection = defer(() => this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private toConnectState(fcl: Fcl):  Observable<ConnectionState<FlowProviderConnectionResult>>{
		return new Observable<ConnectionState<FlowProviderConnectionResult>>((subscriber) => {

			const disconnect = () => fcl.unauthenticate()

			const user = fcl.currentUser()
			Promise.all([user.authenticate()]).then(([auth]) => {
				if (!auth.addr) {
					subscriber.next(getStateDisconnected())
				} else {
					const wallet: FlowProviderConnectionResult = {
						blockchain: Blockchain.FLOW,
						fcl,
						address: auth.addr,
					}

					subscriber.next(getStateConnected({
						connection: wallet,
						disconnect,
					}))
				}
			}).catch((err) => {
				subscriber.next(getStateDisconnected({ error: err }))
			})
		})
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
		return !!instance.currentUser()
	}
}
