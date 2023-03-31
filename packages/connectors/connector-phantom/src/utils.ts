export function waitUntil(checkFn: () => boolean, checkDelay: number, timeout: number): Promise<void> {
	const startTime = Date.now()

	function check(resolve: () => void, reject: () => void) {
		if (checkFn()) {
			resolve()
		} else if (Date.now() - startTime > timeout) {
			reject()
		} else {
			setTimeout(() => check(resolve, reject), checkDelay)
		}
	}

	return new Promise((resolve, reject) => {
		check(resolve, reject)
	})
}