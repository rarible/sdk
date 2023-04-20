export enum LogsLevel {
	DISABLED = 0,
	ERROR = 1,
	TRACE = 2,
}

export function getErrorMessageString(err: any): string {
	try {
		if (!err) {
			return "not defined"
		} else if (typeof err === "string") {
			return err
		} else if (err instanceof Error) {
			return getExecRevertedMessage(err.message)
		} else if (err.message) {
			return typeof err.message === "string" ? getExecRevertedMessage(err.message) : JSON.stringify(err.message)
		} else if (err.status !== undefined && err.statusText !== undefined) {
			return JSON.stringify({
				url: err.url,
				status: err.status,
				statusText: err.statusText,
			})
		} else {
			return JSON.stringify(err)
		}
	} catch (e: any) {
		return `getErrorMessageString parse error: ${e?.message}`
	}
}

const execRevertedRegexp = /execution reverted:(.*[^\\])/
const ethersSig = "Error while gas estimation with message cannot estimate gas"
const ethersRevertedRegexp = /"execution reverted[:]?(.*?)"/

export function getExecRevertedMessage(msg: string) {
	if (!msg) return msg
	try {
		const result = msg.includes(ethersSig) ? msg.match(ethersRevertedRegexp): msg.match(execRevertedRegexp)
		if (result && result[1]) {
			return result[1].trim()
		}
	} catch (e) {}

	return msg
}
