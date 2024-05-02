import type { Observable } from "rxjs"
import { combineLatest, defer } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import type {
	ConnectionState,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	getStateConnected, getStateConnecting,
	getStateDisconnected,
	promiseToObservable,
} from "@rarible/connector"
import type { Maybe } from "@rarible/types"
import type { AptosProviderConnectionResult } from "./domain"
import { getAddress, getNetwork, setAccountActive } from "./common"

const PROVIDER_ID = "aptos" as const

export enum AptosWalletType {
	"Petra" = "Petra",
}

export class AptosConnectionProvider extends
	AbstractConnectionProvider<AptosWalletType, AptosProviderConnectionResult> {
  private readonly connection: Observable<ConnectionState<AptosProviderConnectionResult>>

  constructor() {
  	super()
  	this.connection = defer(() => connect()).pipe(
  		mergeMap(() => promiseToObservable(getWalletAsync())),
  		map((wallet) => {
  			if (wallet) {
  				const disconnect = () => {
  					if ("disconnect" in wallet.provider) {
  						return wallet.provider.disconnect()
  					}
  					return Promise.resolve()
  				}
  				return getStateConnected({ connection: wallet, disconnect })
  			} else {
  				return getStateDisconnected()
  			}
  		}),
  		startWith(getStateConnecting({ providerId: PROVIDER_ID })),
  	)
  }

  getId(): string {
  	return PROVIDER_ID
  }

  getConnection(): Observable<ConnectionState<AptosProviderConnectionResult>> {
  	return this.connection
  }

  getOption(): Promise<Maybe<AptosWalletType>> {
  	const provider = getInjectedProvider()
  	return Promise.resolve(provider?.type)
  }

  async isAutoConnected(): Promise<boolean> {
  	return false
  }

  async isConnected(): Promise<boolean> {
  	const dapp = getInjectedProvider()
  	if (dapp?.provider !== undefined) {
  		try {
  		  return !!(await dapp.provider.account())
  		} catch (_) {}
  		return false
  	} else {
  		return false
  	}
  }
}

async function connect(): Promise<void> {
	const dapp = getInjectedProvider()
	if (!dapp) {
		throw new Error("Injected provider not available")
	}
	await setAccountActive(dapp.provider)
}


async function getWalletAsync(): Promise<Observable<AptosProviderConnectionResult | undefined>> {
	const dapp = getInjectedProvider()
	return combineLatest([getAddress(dapp?.provider), getNetwork(dapp?.provider)]).pipe(
		map(([address, network]) => {
			setAccountActive(dapp?.provider)
			if (address) {
				return {
					network,
					address,
					provider: dapp?.provider,
				}
			} else {
				return undefined
			}
		}),
	)
}

function getInjectedProvider(): AptosDapp | undefined {
	const global: any = typeof window !== "undefined" ? window : undefined
	if (global) {
		return getDapp(global)
	}
	return undefined
}


export function getDapp(global: any): AptosDapp | undefined {
	if ("aptos" in global) {
		return { provider: global.aptos, type: AptosWalletType.Petra }
	}

	return undefined
}

export type AptosDapp = { provider: any, type: AptosWalletType }

export * from "./domain"
