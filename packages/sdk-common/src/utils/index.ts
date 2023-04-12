export function getStringifiedError(error: any): string | undefined {
	try {
		const errorObject = Object.getOwnPropertyNames(error)
			.reduce((acc, key) => {
				acc[key] = error[key]
				return acc
			}, {} as Record<any, any>)
		return JSON.stringify(errorObject, null, "  ")
	} catch (e) {
		return undefined
	}
}
