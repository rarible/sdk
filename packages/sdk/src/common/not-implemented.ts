import { Action } from "@rarible/action"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function notImplemented(...args: unknown[]): never {
	throw new Error("Not implemented")
}

export const nonImplementedAction = Action.create<any, any, any>({
	id: "non-implemented",
	run: async () => notImplemented(),
})
