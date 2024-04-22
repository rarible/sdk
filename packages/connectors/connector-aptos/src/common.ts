import { Observable, from } from "rxjs"
import type { Network } from "./domain"

export function getObservable<Raw, T>(
	provider: any,
	getRaw: (provider: any) => Promise<Raw>,
	mapRaw: (raw: Raw) => T,
	eventName: string
): Observable<T> {
	if (eventName in provider) {
		return new Observable<T>(subscriber => {
			const handler = (raw: Raw) => {
				subscriber.next(mapRaw(raw))
			}
			getRaw(provider)
				.then(handler)
				.catch(err => subscriber.error(err))
			provider[eventName](handler)
		})
	} else {
		return from((async () => {
			const raw = await getRaw(provider)
			return mapRaw(raw)
		})())
	}
}

export function getAddress(provider: any): Observable<string> {
	return getObservable<string, string>(
		provider,
		(provider) => provider.account(),
		(account) => account,
		"onAccountChange"
	)
}

export function getNetwork(provider: any): Observable<Network> {
	return getObservable<Network, Network>(
		provider,
		(provider) => provider.network(),
		(network) => network,
		"onNetworkChange"
	)
}
