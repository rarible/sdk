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

/*
const middle1: Middleware = (callable, args) => {
	console.log("mid1 args", args)
	args[0] +=  " ^_^"

	return Promise.resolve([callable, (prom: Promise<any>) => {
		return prom
	}])
}

const middle2: Middleware = (callable, args) => {
	console.log("error catcher args", args)
	args[0] +=  " with catch"

	return Promise.resolve([callable, (prom: Promise<any>) => {
		prom.catch((err: any) => console.log("cathed: ", err))
		return prom
	}])
}

const middle4: Middleware = (callable, args) => {
	console.log("error catcher4 args", args)

	return Promise.resolve([callable, (prom: Promise<any>) => {
		return prom.catch((err: any) => console.log("cathed4: ", err))
		return prom
	}])
}

const middle3: Middleware<(s: string) => string> = (callable, args) => {
	console.log("mid3", args)

	return Promise.resolve([(...args: [string]) => {

		console.log("before call")
		let r = callable(...args)
		console.log("after call")

		return r
	}, undefined])
}

const middle5: Middleware = (callable, args) => {
	console.log("mid5", args)

	return Promise.resolve([callable, async (res) => {
		const r = await res
		console.log("mid5 reported, result is ", r)
		return "{{{" + r.result + "}}}"
	}])
}

const middle6: Middleware = (callable, args) => {
	console.log("mid5", args)

	return Promise.resolve([callable, async (res) => {
		console.log("mid6 reported, result is ", await res)
		return res
	}])
}

const method = (a: number, b: boolean, s: string): {result: string} => {
	return {
		result: a + s + b,
	}
}

let method2 = async (s: string) => {
	console.log("method call " + s)
	return Promise.reject("Scarry error")
}

(async () => {
	//middlewareMethodCall(method, 42, false, "papiroska", [middle1, middle2])

	const mm = new Middlewarer()
	mm
		.use(middle5)
		.use(middle1)
		.use(middle3)
		.use(middle2)
		.use(middle4)
		.use(middle6)

	const wrappedMethod2 = mm.wrap(method2)
	await mm.call(method, 42, false, "papiroska")
	//mm.call(method2, "nya?")
	//await wrappedMethod2("nya nya")
})()
*/
