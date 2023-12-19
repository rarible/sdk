/**
 * Will match subset inside object and if no match happen
 * throws a error with debugging message, useful for tests
 */

export function subsetMatch<T extends object>(obj: T, subset: Partial<T>): boolean {
	for (const key in subset) {
		if (!(key in obj) || !deepEqual(obj[key], subset[key])) {
			const errorDetails = JSON.stringify({ key, expected: subset[key], actual: obj[key] })
			throw new Error(`Subset match failed: ${errorDetails}`)
		}
	}
	return true
}

function deepEqual(a: any, b: any): boolean {
	if (typeof a !== typeof b) {
		return false
	}

	if (typeof a !== "object" || a === null || b === null) {
		return a === b
	}

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)

	if (keysA.length !== keysB.length) {
		return false
	}

	for (const key of keysA) {
		if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
			return false
		}
	}

	return true
}