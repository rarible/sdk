import type { Observable } from "rxjs"
import { defer, of } from "rxjs"
import type { TezosToolkit } from "@taquito/taquito"
import type { BeaconWallet } from "@taquito/beacon-wallet"
import { catchError, first, map, mergeMap, startWith } from "rxjs/operators"
import type { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { cache } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnected, getStateConnecting, getStateDisconnected } from "../../connection-state"
import { Blockchain } from "../../common/provider-wallet"
import type { TezosProviderConnectionResult } from "./domain"

export type BeaconConfig = {
	appName: string,
	accessNode: string
	network: TezosNetwork
}
const PROVIDER_ID = "beacon" as const

export class BeaconConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, TezosProviderConnectionResult> {

	private readonly instance: Observable<{ beaconWallet: BeaconWallet, tezosToolkit: TezosToolkit }>
	private readonly connection: Observable<ConnectionState<TezosProviderConnectionResult>>

	constructor(
		private readonly config: BeaconConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap(({ beaconWallet, tezosToolkit }) => this.toConnectState(beaconWallet, tezosToolkit)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private toConnectState(
		beaconWallet: BeaconWallet,
		tezosToolkit: TezosToolkit
	): Observable<ConnectionState<TezosProviderConnectionResult>> {
		const disconnect = async () => {
			await beaconWallet.disconnect()
			await beaconWallet.client.removeAllPeers()
			await beaconWallet.client.removeAllAccounts()
			await beaconWallet.client.destroy()
		}
		return defer(() => this.getAddress(beaconWallet)).pipe(
			map(address => getStateConnected<TezosProviderConnectionResult>({
				connection: {
					blockchain: Blockchain.TEZOS,
					address,
					toolkit: tezosToolkit,
					wallet: beaconWallet,
				},
				disconnect,
			})),
		)
	}

	private async getAddress(beaconWallet: BeaconWallet): Promise<string> {
		let address: Promise<string>
		const activeAccount = await beaconWallet.client.getActiveAccount()
		if (activeAccount) {
			address = Promise.resolve(activeAccount.address)
		} else {
			await beaconWallet.requestPermissions({
				network: {
					type: this.config.network,
					rpcUrl: this.config.accessNode,
				},
			})
			address = beaconWallet.getPKH()
		}

		return address
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection(): Observable<ConnectionState<TezosProviderConnectionResult>> {
		return this.connection
	}

	private async _connect(): Promise<{ beaconWallet: BeaconWallet, tezosToolkit: TezosToolkit }> {
		const { TezosToolkit } = await import("@taquito/taquito")
		const { BeaconWallet } = await import("@taquito/beacon-wallet")

		const wallet = new BeaconWallet({
			name: this.config.appName,
			preferredNetwork: this.config.network,
		})
		const tk = new TezosToolkit(this.config.accessNode)
		tk.setWalletProvider(wallet)

		return {
			beaconWallet: wallet,
			tezosToolkit: tk,
		}
	}

	async getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return PROVIDER_ID
	}

	async isAutoConnected() {
		return false
	}

	async isConnected(): Promise<boolean> {
		const instance = await this.instance.pipe(first()).toPromise()
		const account = await instance.beaconWallet.client.getActiveAccount()
		return !!account
	}
}
