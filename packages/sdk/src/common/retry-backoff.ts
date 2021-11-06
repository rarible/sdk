export function retryBackoff<T>(num: number, delay: number, thunk: () => Promise<T>): Promise<T> {
	return thunk()
		.catch((error) => {
			if (num === 0) {
				throw error
			}
			return new Promise((resolve, reject) => {
				setTimeout(() => retryBackoff(num - 1, delay, thunk).then(resolve).catch(reject), delay)
			})
		})
}