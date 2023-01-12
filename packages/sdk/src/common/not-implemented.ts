import { Action } from "@rarible/action"

export function getNotImplementedFn(msg?: string) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return (...args: unknown[]): never => {
		throw new Error(msg || "Not implemented")
	}
}

export function getNonImplementedAction(msg?: string) {
	return Action.create<any, any, any>({
		id: "non-implemented",
		run: getNotImplementedFn(msg),
	})
}

export const notImplemented = getNotImplementedFn()

export const nonImplementedAction = getNonImplementedAction()
