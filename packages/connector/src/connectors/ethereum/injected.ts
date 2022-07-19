import type { Observable } from "rxjs"
import { combineLatest, defer } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import { AbstractConnectionProvider } from "../../provider"
import type { Maybe } from "../../common/utils"
import { promiseToObservable } from "../../common/utils"
import type { ConnectionState } from "../../connection-state"
import { getStateConnecting, getStateDisconnected, getStateConnected } from "../../connection-state"
import { ethAccounts, getAddress } from "./common/get-address"
import { getChainId } from "./common/get-chain-id"
import type { EthereumProviderConnectionResult } from "./domain"

export enum DappType {
	Metamask = "Metamask",
	Trust = "Trust",
	GoWallet = "GoWallet",
	AlphaWallet = "AlphaWallet",
	Status = "Status",
	Coinbase = "Coinbase",
	Cipher = "Cipher",
	Mist = "Mist",
	Parity = "Parity",
	ImToken = "ImToken",
	Dapper = "Dapper",
	Mock = "Mock",
	Generic = "Web3",
	LedgerConnect = "LedgerConnect",
}

const PROVIDER_ID = "injected" as const

export class InjectedWeb3ConnectionProvider extends
	AbstractConnectionProvider<DappType, EthereumProviderConnectionResult> {
	private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

	constructor() {
		super()
		this.connection = defer(() => connect()).pipe(
			mergeMap(() => promiseToObservable(getWalletAsync())),
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

	getOption(): Promise<Maybe<DappType>> {
		const provider = getInjectedProvider()
		return Promise.resolve(getDappType(provider))
	}

	isAutoConnected(): Promise<boolean> {
		const provider = getInjectedProvider()
		const dapp = getDappType(provider)
		return Promise.resolve(isDappSupportAutoConnect(dapp))
	}

	async isConnected(): Promise<boolean> {
		const provider = getInjectedProvider()
		if (provider !== undefined) {
			return ethAccounts(provider)
				.then(([account]) => account !== undefined)
		} else {
			return Promise.resolve(false)
		}
	}
}

async function connect(): Promise<void> {
	const provider = getInjectedProvider()
	if (!provider) {
		throw new Error("Injected provider not available")
	}
	const accounts = await ethAccounts(provider)
	if (!accounts || accounts.length === 0) {
		await enableProvider(provider)
	}
}

async function getWalletAsync(): Promise<Observable<EthereumProviderConnectionResult | undefined>> {
	const provider = getInjectedProvider()
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
		} catch (e) {
			if (typeof provider.enable === "function") {
				await provider.enable()
			}
		}
	} else {
		if (typeof provider.enable === "function") {
			await provider.enable()
		}
	}
	return provider
}

function getInjectedProvider(): any | undefined {
	let provider: any = undefined
	const global: any = typeof window !== "undefined" ? window : undefined
	if (!global) {
		return provider
	} else if (global.ethereum) {
		provider = global.ethereum;
		(provider as any).autoRefreshOnNetworkChange = false
	} else if (global.web3?.currentProvider) {
		provider = global.web3.currentProvider
	}
	return provider
}

function getDappType(provider: any): Maybe<DappType> {
	if (provider !== undefined) {
		if (provider) {
			if (provider.isImToken) return DappType.ImToken
			if (provider.isDapper) return DappType.Dapper
			if (provider.isMetaMask) return DappType.Metamask
			if (provider.isTrust) return DappType.Trust
			if (provider.isGoWallet) return DappType.GoWallet
			if (provider.isAlphaWallet) return DappType.AlphaWallet
			if (provider.isStatus) return DappType.Status
			if (provider.isToshi) return DappType.Coinbase
			if (provider.isLedgerConnect) return DappType.LedgerConnect
			if (typeof (window as any).__CIPHER__ !== "undefined") return DappType.Cipher
			if (provider.constructor.name === "EthereumProvider") return DappType.Mist
			if (provider.constructor.name === "Web3FrameProvider") return DappType.Parity
			if (provider.constructor.name === "Web3ProviderEngine") return DappType.Mock
			return DappType.Generic
		}
	}

	return undefined
}

function isDappSupportAutoConnect(dapp: Maybe<DappType>): boolean {
	if (!dapp) {
		return false
	}

	const unsupportedDappTypes: Set<DappType> = new Set([DappType.Dapper])
	const disabledAutoLogin = new Set([DappType.Generic, DappType.Metamask])

	return !(unsupportedDappTypes.has(dapp) || disabledAutoLogin.has(dapp))
}
