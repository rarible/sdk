export class DebugLogger {
	constructor(private readonly enabled: boolean) {

	}

	log(...args: any[]) {
		if (!this.enabled) {
			return
		}
		console.log(...args)
	}

	error(...args: any[]) {
		if (!this.enabled) {
			return
		}
		console.error(...args)
	}
}