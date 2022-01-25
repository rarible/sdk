import type { Middleware } from "./middleware"
import { Middlewarer } from "./middleware"

function getMiddleware(name: string, checks: string[]): Middleware {
	return async (callable, args) => {
		checks.push(name + "_1")
		checks.push(name + "_args_[" + args.toString() + "]") // use original arguments
		return [callable, async (response) => {
			checks.push(name + "_" + await response) // use original function result
			checks.push(name + "_4")
			return response
		}]
	}
}

describe("SDK Middleware", () => {
	let middlewarer: Middlewarer
	let handler = jest.fn(async (a, b) => await a + b)
	let checks: string[]

	beforeEach(() => {
		middlewarer = new Middlewarer()
		handler = jest.fn(async (a, b) => await a + b)
		checks = []
	})

	test("Should use middleware", async () => {
		middlewarer.use(getMiddleware("mid", checks))
		await middlewarer.call(handler, "2", "3")

		expect(handler).toBeCalled()
		expect(checks).toEqual(["mid_1", "mid_args_[2,3]", "mid_23", "mid_4"])
	})

	test("Should wrap method", async () => {
		middlewarer.use(getMiddleware("mid", checks))
		const wrappedHandler = middlewarer.wrap(handler)

		await wrappedHandler("2", "3")
		expect(handler).toBeCalledTimes(1)

		await wrappedHandler("20", "30")
		expect(handler).toBeCalledTimes(2)

		expect(checks).toEqual([
			"mid_1", "mid_args_[2,3]", "mid_23", "mid_4", // first call
			"mid_1", "mid_args_[20,30]", "mid_2030", "mid_4", // second call
		])
	})

	test("Should wrap object methods", async () => {
		middlewarer.use(getMiddleware("mid", checks))

		const obj = {
			method1: jest.fn(async (a) => await "m1" + a),
			method2: jest.fn(async (a) => await "m2" + a),
			method3: jest.fn(async (a) => await "m3" + a),
		}

		const mock1 = obj.method1
		const mock2 = obj.method2
		const mock3 = obj.method3

		middlewarer.wrapObjectMethods(obj, { namespace: "obj" })

		await obj.method1("1")
		await obj.method2("2")
		await obj.method3("3")

		expect(mock1).toBeCalled()
		expect(mock2).toBeCalled()
		expect(mock3).toBeCalled()
		expect(checks).toEqual([
			"mid_1", "mid_args_[1]", "mid_m11", "mid_4",
			"mid_1", "mid_args_[2]", "mid_m22", "mid_4",
			"mid_1", "mid_args_[3]", "mid_m33", "mid_4",
		])
	})

	test("Middleware should wrap original method", async () => {
		middlewarer.use(async (callable, args) => {
			return [() => {
				checks.push("before call")
				const r = callable(...args)
				checks.push("after call")
				return r
			}, async (response) => {
				checks.push("response " + await response)
			}]
		})

		const handler = jest.fn(async (a) => {
			checks.push("call")
			return await a
		})
		const wrappedHandler = middlewarer.wrap(handler)
		await wrappedHandler("test")

		expect(handler).toBeCalledTimes(1)
		expect(checks).toEqual(["before call", "call", "after call", "response test"])
	})

	test("Middleware should change original arguments", async () => {
		middlewarer.use(async (callable, args) => {
			args[0] = "new1"
			args[1] = "new2"
			return [callable, (response) => response]
		})

		const handler = jest.fn(async (a, b) => {
			checks.push(a)
			checks.push(b)
		})
		const wrappedHandler = middlewarer.wrap(handler)
		await wrappedHandler("old1", "old2")

		expect(handler).toBeCalledTimes(1)
		expect(checks).toEqual(["new1", "new2"])
	})

	test("Middleware should handle original method throw", async () => {
		middlewarer.use(async (callable) => {
			return [callable, async (response) => {
				try {
					await response
				} catch (e: any) {
					checks.push(e)
				}
			}]
		})

		const handler = jest.fn(async (a, b) => {
			throw a + b // eslint-disable-line no-throw-literal
		})
		const wrappedHandler = middlewarer.wrap(handler)
		await wrappedHandler("1", "2")

		expect(handler).toBeCalledTimes(1)
		expect(checks).toEqual(["12"])
	})
})
