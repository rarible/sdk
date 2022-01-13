/**
 * Middleware function type
 * Middleware function gets `callable` method and arguments with which it will be called.
 * Must return a Promise which will resolve as array [(new) function, callback]
 * 	where:
 * 		function - original method, or replace for it (f.e. wrapped).
 * 		callback - function which will be called with "promisified" result of execution `callable`,
 * 			should return received promise, new promise, or new result value
 */
import { toPromise } from "./utils"

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
			([wrappedCallable, cb] = await mid(callable, args))
			if (cb) {
				callbacks.push(cb)
			}
		}
		let res = toPromise(callable(...args))

		for (const mid of callbacks) {
			res = toPromise(mid(res))
		}

		return await res
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
	wrap<Fun extends (...args: any[]) => Promise<any>>(callable: Fun, meta: {
		methodName?: string
	} = {}): (...args: Parameters<Fun>) => ReturnType<Fun> {
		const fnName =meta?.methodName || callable.name || "anonymous"
		Object.defineProperty(callable, "name", { value: fnName, writable: false })
		const wrapped = (...args: Parameters<Fun>) => this.call(callable, ...args)
		//@ts-ignore
		return wrapped
	}

	/**
	 * Wrap all methods in object
	 *
	 * @param object
	 * @param meta metadata for new method
	 */
	wrapObjectMethods(object: any, meta: {
		namespace: string,
	} = {
		namespace: "",
	}) {
		for (const prop in object) {
			if (object.hasOwnProperty(prop) && typeof object[prop] === "function") {
				object[prop] = this.wrap(object[prop], {
					methodName: (meta.namespace ? meta.namespace + "." : "") + prop,
				})
			}
		}
	}
}
