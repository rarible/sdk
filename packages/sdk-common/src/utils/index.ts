export function getStringifiedData(data: any): string | undefined {
	try {
		const errorObject = Object.getOwnPropertyNames(data)
			.reduce((acc, key) => {
				acc[key] = data[key]
				return acc
			}, {} as Record<any, any>)
		return JSON.stringify(errorObject, null, "  ")
	} catch (e) {
		return undefined
	}
}
