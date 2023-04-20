import { NetworkError } from "@rarible/logger/build"
import type { AbstractLogger } from "@rarible/logger/build/domain"
import { LogLevel } from "@rarible/logger/build/domain"
import { getStringifiedData } from "@rarible/sdk-common"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../get-sdk-context"
import { getRemoteLogger } from "../get-sdk-context"
import { getErrorLevel } from "./logger-overrides"
import { getErrorMessageString, LogsLevel } from "./common"

export function getInternalLoggerMiddleware(
	logsLevel: LogsLevel,
	sdkContext: ISdkContext,
	externalLogger?: AbstractLogger
): Middleware {
	const remoteLogger = externalLogger ?? getRemoteLogger(sdkContext)

	return async (callable, args) => {
		const time = Date.now()

		return [callable, async (responsePromise) => {
			let parsedArgs
			try {
				parsedArgs = JSON.stringify(args)
			} catch (e) {
				try {
				  parsedArgs = JSON.stringify(args, Object.getOwnPropertyNames(args))
				} catch (err) {
					parsedArgs = "unknown"
				}
			}
			try {
				const res = await responsePromise
				if (logsLevel >= LogsLevel.TRACE) {
					remoteLogger.raw({
						level: LogLevel.TRACE,
						method: callable.name,
						message: "trace of " + callable.name,
						duration: (Date.now() - time) / 1000,
						args: parsedArgs,
						resp: JSON.stringify(res),
					})
				}
			} catch (err: any) {
				if (logsLevel >= LogsLevel.ERROR) {
					let data
					try {
						data = {
							level: getErrorLevel(callable?.name, err, sdkContext?.wallet),
							method: callable?.name,
							message: getErrorMessageString(err),
							error: getStringifiedData(err),
							duration: (Date.now() - time) / 1000,
							args: parsedArgs,
							requestAddress: undefined as undefined | string,
						}
						if (err instanceof NetworkError || err?.name === "NetworkError") {
							data.requestAddress = err?.url
						}
					} catch (e) {
						data = {
							level: "LOGGING_ERROR",
							method: callable?.name,
							message: getErrorMessageString(e),
							error: getStringifiedData(e),
						}
					}
					remoteLogger.raw(data)
				}
			}
			return responsePromise
		}]
	}
}
