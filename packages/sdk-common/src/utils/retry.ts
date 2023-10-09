export function retry<T>(
	num: number,
	del: number,
	thunk: () => Promise<T>
): Promise<T> {
	return thunk().catch((error) => {
		if (num === 0) {
			throw error
		}
		return delay(del).then(() => retry(num - 1, del, thunk))
	})
}

export function delay(num: number) {
	return new Promise<void>((r) => setTimeout(r, num))
}

/**
 * Retry with conditions (for catching and skipping special errors)
 * @param num attempts amount
 * @param del delay
 * @param thunk retrying function
 * @param conditionCallback if callbacks returns true, proceed retrying
 */
export function conditionalRetry<T>(
	num: number,
	del: number,
	thunk: () => Promise<T>,
	conditionCallback: (error: any) => boolean
): Promise<T> {
	return thunk().catch((error) => {
		if (num === 0 || !conditionCallback(error)) {
			throw error
		}
		return delay(del).then(() => conditionalRetry(num - 1, del, thunk, conditionCallback))
	})
}
