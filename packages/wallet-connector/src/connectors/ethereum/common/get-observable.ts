import { interval, Observable } from "rxjs"
import { concatMap } from "rxjs/operators"

export function getObservable<Raw, T>(
	provider: any,
	getRaw: (provider: any) => Promise<Raw>,
	mapRaw: (raw: Raw) => T,
	eventName: string,
	period: number = 1000,
): Observable<T> {
	if ("on" in provider) {
		return new Observable<T>(subscriber => {
			const handler = (raw: Raw) => {
				subscriber.next(mapRaw(raw))
			}
			getRaw(provider)
				.then(handler)
				.catch(err => subscriber.error(err))
			provider.on(eventName, handler)
			if ("removeListener" in provider) {
				subscriber.add(() => {
					provider.removeListener(eventName, handler)
				})
			}
		})
	} else {
		return interval(period).pipe(
			concatMap(async () => {
				const raw = await getRaw(provider)
				return mapRaw(raw)
			})
		)
	}
}
