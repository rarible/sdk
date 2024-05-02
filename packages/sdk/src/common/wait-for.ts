import { retry } from "./retry"

export async function waitFor<T>(
	promise: () => Promise<T>,
	predicate?: (value: T) => boolean,
	interval: number = 1000
) {
	return retry(10, interval, async () => {
		const result = await promise()
		if (predicate) {
			if (!predicate(result)) {
				throw new Error(`Predicate is not matched: expected ${JSON.stringify(result)}`)
			}
		}
		return result
	})
}
