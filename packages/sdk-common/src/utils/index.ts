export * from "./promise-settled"
export * from "./address"
export * from "./blockchain"
export * from "./retry"

export function getStringifiedData(data: any): string | undefined {
	try {
		if (typeof data === "string") {
			return data
		}
		const errorObject = Object.getOwnPropertyNames(data)
			.reduce((acc, key) => {
				acc[key] = data[key]
				return acc
			}, {} as Record<any, any>)
		return JSON.stringify(errorObject, replaceErrors, "  ")
	} catch (e) {
		return undefined
	}
}

function replaceErrors(key: string, value: unknown) {
	try {
		if (value instanceof Error) {
			const error: Record<string | number | symbol, unknown> = {}

			Object.getOwnPropertyNames(value).forEach(function (propName) {
				// @ts-ignore
				error[propName] = value[propName]
			})

			return error
		}
	} catch (_) {}

	return value
}

export function deepReplaceBigInt(o: unknown): any {
	if (Array.isArray(o)) {
		return o.map(item => deepReplaceBigInt(item))
	}
	if (typeof o === "object" && o !== null ) {
		const clonedObject = { ...o } as Record<string, unknown>
		return Object.keys(clonedObject).reduce((acc, key) => {
			acc[key] = deepReplaceBigInt(acc[key])
			return acc
		}, clonedObject)
	}
	if (typeof o === "bigint") return o.toString()
	return o
}

export * from "./types"
export * from "./web3"
