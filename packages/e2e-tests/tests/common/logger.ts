const logsEnabled = process.env.LOGGER_ENABLED === "1"

export class Logger {
	static log(...args: any[]) {
		if (logsEnabled) {
			console.log(...args)
		}
	}
}
