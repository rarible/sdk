import { from, Observable } from "rxjs"
import { mergeMap } from "rxjs/operators"

export type Maybe<T> = T | undefined

export function cache<T>(fn: () => Promise<T>): Observable<T> {
	let promise: Promise<T> | undefined = undefined
	return new Observable<T>(subscriber => {
		if (promise === undefined) {
			promise = fn()
		}
		promise
			.then(value => subscriber.next(value))
			.catch(error => {
				promise = undefined
				subscriber.error(error)
			})
	})
}

export function promiseToObservable<T>(promise: Promise<Observable<T>>): Observable<T> {
	return from(promise).pipe(
		mergeMap(it => it),
	)
}

export function noop() {}
