export function getParsedError(e: any): Record<any, any> {
	try {
		return Object.getOwnPropertyNames(e)
			.reduce((acc, key) => {
				acc[key] = e[key]
				return acc
			}, {} as Record<any, any>)
	} catch (e) {
		return {}
	}
}
