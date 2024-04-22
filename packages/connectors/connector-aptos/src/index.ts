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
import { hasCode } from "@rarible/sdk-common"
import type { AptosProviderConnectionResult } from "./domain"
import { getAddress, getNetwork } from "./common"

const PROVIDER_ID = "aptos" as const

export enum AptosWalletType {
	"Petra" = "Petra",
}

export type AptosConnectionConfig = {
	// prefer?: AptosWalletType[]
}

export class AptosConnectionProvider extends
	AbstractConnectionProvider<AptosWalletType, AptosProviderConnectionResult> {
  private readonly connection: Observable<ConnectionState<AptosProviderConnectionResult>>

  constructor(
  	private readonly config: AptosConnectionConfig = { prefer: [] },
  ) {
  	super()
  	this.connection = defer(() => connect(config)).pipe(
  		mergeMap(() => promiseToObservable(getWalletAsync(config))),
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
  	return Promise.resolve(getDappType(provider))
  }

  async isAutoConnected(): Promise<boolean> {
  	return false
  }

  async isConnected(): Promise<boolean> {
  	const provider = getInjectedProvider()
  	if (provider !== undefined) {
  		return !!(await provider.account())
  	} else {
  		return false
  	}
  }
}

async function connect(config: AptosConnectionConfig): Promise<void> {
	const provider = getInjectedProvider()
	if (!provider) {
		throw new Error("Injected provider not available")
	}
	try {
	  await provider.account()
	} catch (e) {
		if (hasCode(e) && e.code === 4100) {
			await provider.connect()
		}
	}
}

async function getWalletAsync(
	config: AptosConnectionConfig
): Promise<Observable<AptosProviderConnectionResult | undefined>> {
	const provider = getInjectedProvider()
	return combineLatest([getAddress(provider), getNetwork(provider)]).pipe(
		map(([address, network]) => {
			if (address) {
				return {
					network,
					address,
					provider,
				}
			} else {
				return undefined
			}
		}),
	)
}

function getInjectedProvider(): any | undefined {
	const global: any = typeof window !== "undefined" ? window : undefined
	if (global) {
		return getDappType(global)
	}
	return undefined
}

export function getDappType(global: any) {
	if ("aptos" in global) {
		return global.aptos
	}
	return undefined
}

export * from "./domain"
