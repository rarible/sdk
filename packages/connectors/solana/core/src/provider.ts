import { Observable } from "rxjs"
import { combineLatest, throwError, of, from } from "rxjs"
import { map, take, switchMap, catchError, shareReplay, startWith, distinctUntilChanged, pluck } from "rxjs/operators"
import type { ConnectionState } from "@rarible/connector"
import { AbstractConnectionProvider, getStateConnecting } from "@rarible/connector"
import { getStateConnected, getStateDisconnected } from "@rarible/connector"
import type { PublicKey } from "@solana/web3.js"
import type { SolanaSigner, SolanaConnectResult, SolanaProvider } from "@rarible/solana-common"
import type { SolanaProviderAdapter } from "./domain"

export abstract class SolanaInjectableProvider<
	ProviderId extends string
> extends AbstractConnectionProvider<ProviderId, SolanaSigner> {

    private readonly provider$: Observable<SolanaProvider | undefined>
    private readonly isConnected$: Observable<boolean>
	private readonly connection$: Observable<ConnectionState<SolanaSigner>>

	constructor(
		private readonly providerId: ProviderId,
		private readonly adapter$: Observable<SolanaProviderAdapter>
	) {
		super()
		this.provider$ = adapter$.pipe(
			pluck("provider"),
			catchError(() => of(undefined)),
			shareReplay(1)
		)
		this.isConnected$ = this.provider$.pipe(map(x => x ? Boolean(x.isConnected) : false))
		this.connection$ = this.provider$.pipe(
			switchMap(x => x ? of(x) : throwError(new NoSolanaProviderError())),
			switchMap(x => from(x.connect()).pipe(switchMap(y => this.toConnectState(y, x)))),
			startWith(getStateConnecting({ providerId })),
		)
	}

    getId = () => this.providerId

	getConnection = () => this.connection$

	getOption = async () => this.providerId

	isConnected = () => this.isConnected$.pipe(take(1)).toPromise()

	private getIsConnectedObservable(provider: SolanaProvider): Observable<boolean> {
		return new Observable<boolean>(subscriber => {
			subscriber.next(true)

			if (typeof provider.on === "function") {
				const disconnectHandler = () => {
					subscriber.next(false)
				}
				provider.on("disconnect", disconnectHandler)
				subscriber.add(() => {
					provider.removeListener("disconnect", disconnectHandler)
				})
			}
		})
	}

	private getAddressObservable(publicKey: PublicKey, provider: SolanaProvider): Observable<PublicKey | null> {
		return new Observable<PublicKey | null>(subscriber => {
			subscriber.next(publicKey)

			if (typeof provider.on === "function") {
				const accountChangeHandler = (publicKey: PublicKey | null) => {
					subscriber.next(publicKey)
				}
				provider.on("accountChanged", accountChangeHandler)
				subscriber.add(() => {
					provider.removeListener("accountChanged", accountChangeHandler)
				})
			}
		})
	}

	private toConnectState(
		result: SolanaConnectResult,
		provider: SolanaProvider
	): Observable<ConnectionState<SolanaSigner>> {
		return combineLatest([
			this.getAddressObservable(result.initialPublicKey, provider).pipe(distinctUntilChanged()),
			this.getIsConnectedObservable(provider).pipe(distinctUntilChanged()),
		]).pipe(
			switchMap(([publicKey, isConnected]) => {
				if (isConnected && publicKey) {
					return this.adapter$.pipe(
						map(x => x.toSigner(publicKey)),
						map(x => getStateConnected({ connection: x }))
					)
				}
				return of(getStateDisconnected())
			}),
		)
	}
}

class NoSolanaProviderError extends Error {
	constructor() {
		super("No solana provider found")
		this.name = "NoSolanaProviderError"
	}
}