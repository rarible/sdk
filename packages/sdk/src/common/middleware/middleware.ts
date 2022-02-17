import { Action } from "@rarible/action"
import { toPromise } from "./utils"

const SKIP_MIDDLEWARE = Symbol("SKIP_MIDDLEWARE")

/**
 * Middleware function type
 * Middleware function gets `callable` method and arguments with which it will be called.
 * Must return a Promise which will resolve as array [(new) function, callback]
 * 	where:
 * 		function - original method, or replace for it (f.e. wrapped).
 * 		callback - function which will be called with "promisified" result of execution `callable`,
 * 			should return received promise, new promise, or new result value
 */
export type Middleware<Callable extends (...args: any[]) => any = (...args: any[]) => any> =
	(callable: Callable, args: Parameters<Callable>) => Promise<[
		(...args: Parameters<Callable>) => ReturnType<Callable>,
		((p: Promise<ReturnType<Callable>>) => Promise<ReturnType<Callable>>) | void
	]>

export class Middlewarer {
	private middlewares: Middleware[] = []

	/**
	 * Add middleware to chain
	 */
	use(middleware: Middleware) {
		this.middlewares.push(middleware)
		return this
	}

	/**
	 * Call method with middlewares chain
	 *
	 * @param callable - original method for call
	 * @param ...args - callable arguments
	 */
	async call<Fun extends (...args: any[]) => Promise<any>>(
		callable: Fun,
		...args: Parameters<Fun>
	): Promise<ReturnType<Fun>> {

		let wrappedCallable: any = callable
		const callbacks = []

		for (const mid of this.middlewares) {
			let cb = undefined;
			([wrappedCallable, cb] = await mid(wrappedCallable, args))
			if (cb) {
				callbacks.push(cb)
			}
		}
		let res = toPromise(wrappedCallable(...args))

		for (const mid of callbacks) {
			res = toPromise(mid(res))
		}

		const result = await res
		// wrapping submit methods
		if (typeof result?.submit === "function") {
			result.submit = this.wrap(result.submit, { methodName: callable.name + ".submit" })
		}

		return result
	}

	/**
	 * Wrap function to execute with middlewares in future
	 * @example
	 * 	function fn(i: number) { ... }
	 * 	const wrappedFn = middlewarer.wrap(fn)
	 * 	fn(10)
	 *
	 * @param callable
	 * @param meta metadata for new method
	 */
	wrap<Fun extends (...args: any[]) => Promise<any>>(
		callable: Fun,
		meta: { methodName?: string } = {}
	): ((...args: Parameters<Fun>) => ReturnType<Fun>) | Fun {
		if (callable.hasOwnProperty(SKIP_MIDDLEWARE)) {
			return callable
		}

		const fnName = meta?.methodName || callable.name || "anonymous"

		if (isAction(callable)) {
			// @ts-ignore
			for (let step of callable.steps) {
				const originRun = step.run
				step.run = (...args: Parameters<Fun>) => this.call(originRun, ...args)
				Object.defineProperty(originRun, "name", { value: fnName + "." + step.id, writable: false })
			}
			return callable as Fun
		} else {
			Object.defineProperty(callable, "name", { value: fnName, writable: false })
			return (...args: Parameters<Fun>) => this.call(callable, ...args) as ReturnType<Fun>
		}
	}

	/**
	 * Wrap all methods in object
	 *
	 * @param object
	 * @param meta metadata for new method
	 */
	wrapObjectMethods(object: any, meta: { namespace: string }) {
		for (const prop in object) {
			if (object.hasOwnProperty(prop) && typeof object[prop] === "function") {
				object[prop] = this.wrap(object[prop], {
					methodName: (meta.namespace ? meta.namespace + "." : "") + prop,
				})
			}
		}
	}

	static skipMiddleware<T extends Function>(something: T): T & {skipMiddleware: true} {
		return Object.defineProperty(
			something,
			SKIP_MIDDLEWARE,
			{ value: true, writable: false }
		) as T & {skipMiddleware: true}
	}
}

function isAction(fn: any): fn is Action<any, any, any> {
	return fn instanceof Action
}
