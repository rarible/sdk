
export function waitForDate(targetDate: Date, timeoutTime = 1000 * 60 * 30) {
	return new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error("Timed out"))
		}, timeoutTime)

		const interval = setInterval(() => {
			if (targetDate.getTime() < Date.now()) {
				resolve()
				clearTimeout(timeout)
				clearInterval(interval)
			}
		}, 1000)

	})
}
