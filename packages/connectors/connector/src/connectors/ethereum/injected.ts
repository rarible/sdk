import type { Observable } from "rxjs"
import { combineLatest, defer } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import { DappType, getDappType } from "@rarible/sdk-common"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { promiseToObservable } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting, getStateDisconnected, getStateConnected } from "../../connection-state"
import { ethAccounts, getAddress } from "./common/get-address"
import { getChainId } from "./common/get-chain-id"
import type { EthereumProviderConnectionResult } from "./domain"
const PROVIDER_ID = "injected" as const

export type InjectedWeb3ConnectionConfig = {
	prefer?: DappType[]
}

export class InjectedWeb3ConnectionProvider extends
	AbstractConnectionProvider<DappType, EthereumProviderConnectionResult> {
  private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

  constructor(
	  private readonly config: InjectedWeb3ConnectionConfig = { prefer: [] },
  ) {
  	super()
  	this.connection = defer(() => connect(config)).pipe(
  		mergeMap(() => promiseToObservable(getWalletAsync(config))),
  		map((wallet) => {
  			if (wallet) {
  				const disconnect = () => {
  					if ("close" in wallet.provider) {
  						return wallet.provider.close()
  					}
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

  getConnection(): Observable<ConnectionState<EthereumProviderConnectionResult>> {
  	return this.connection
  }

  getOption() {
  	const provider = getInjectedProvider(this.config)
  	return getDappType(provider)
  }

  isAutoConnected(): Promise<boolean> {
  	const provider = getInjectedProvider(this.config)
  	const dapp = getDappType(provider)
  	return Promise.resolve(isDappSupportAutoConnect(dapp))
  }

  async isConnected(): Promise<boolean> {
  	const provider = getInjectedProvider(this.config)
  	if (provider !== undefined) {
  		return ethAccounts(provider)
  			.then(([account]) => account !== undefined)
  	} else {
  		return Promise.resolve(false)
  	}
  }
}

async function connect(config: InjectedWeb3ConnectionConfig): Promise<void> {
	const provider = getInjectedProvider(config)
	if (!provider) {
		throw new Error("Injected provider not available")
	}
	const accounts = await ethAccounts(provider)
	if (!accounts || accounts.length === 0) {
		await enableProvider(provider)
	}
	provider.on("disconnect", async (rpcError: unknown) => {
		if (detectErrorCode(1013, rpcError)) {
			const [primary] = await provider.request({ method: "eth_accounts" })
			if (primary) return
		}
	})
}

async function getWalletAsync(
	config: InjectedWeb3ConnectionConfig
): Promise<Observable<EthereumProviderConnectionResult | undefined>> {
	const provider = getInjectedProvider(config)
	return combineLatest([getAddress(provider), getChainId(provider)]).pipe(
		map(([address, chainId]) => {
			if (address) {
				return {
					chainId,
					address,
					provider,
				}
			} else {
				return undefined
			}
		}),
	)
}

async function enableProvider(provider: any) {
	if (typeof provider.request === "function") {
		try {
			await provider.request({
				method: "eth_requestAccounts",
			})
		} catch (e: any) {
			if (e && "code" in e && e.code === 4001) {
				return
			}

			try {
				// Attempt wallet_requestPermissions if eth_requestAccounts fails
				// https://github.com/MetaMask/metamask-extension/issues/10085#issuecomment-1244107244
				await provider.request({
					method: "wallet_requestPermissions",
					params: [{ eth_accounts: {} }],
				})
			} catch (e: any) {
				if (typeof provider.enable === "function") {
					await provider.enable()
				}
			}
		}
	} else {
		if (typeof provider.enable === "function") {
			await provider.enable()
		}
	}
	return provider
}

function getInjectedProvider({ prefer }: InjectedWeb3ConnectionConfig): any | undefined {
	let provider: any = undefined

	const global: any = typeof window !== "undefined" ? window : undefined
	if (!global) {
		return provider
	} else if (global.ethereum) {
		if (Array.isArray(global.ethereum.providers)) {
			if (Array.isArray(prefer) && prefer.length) {
				for (const preferredDapp of prefer) {
					const found = global.ethereum.providers.find((p: any) => getDappType(p) === preferredDapp)
					if (found) {
						provider = found
						break
					}
				}
			} else {
				provider = global.ethereum.providers[0]
			}
		}

		provider = provider || global.ethereum;
		(provider as any).autoRefreshOnNetworkChange = false
	} else if (global.web3?.currentProvider) {
		provider = global.web3.currentProvider
	}
	return provider
}

function isDappSupportAutoConnect(dapp: Maybe<DappType>): boolean {
	if (!dapp) {
		return false
	}

	const unsupportedDappTypes: Set<DappType> = new Set([DappType.Dapper])
	const disabledAutoLogin = new Set([DappType.Generic, DappType.Metamask, DappType.Coinbase])

	return !(unsupportedDappTypes.has(dapp) || disabledAutoLogin.has(dapp))
}

export function detectErrorCode(code: number, error: unknown) {
	const parsedCode = typeof error === "object" && error !== null && "code" in error ? (error as any).code : undefined
	return parsedCode === code
}

export { DappType }
