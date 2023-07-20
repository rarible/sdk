import type { ISdkContext } from "../domain"
import { getWalletInfo, loggerConfig } from "./logger/logger-middleware"
const packageJson = require("../../package.json")

export async function getSdkContext(sdkContext: ISdkContext): Promise<Record<string, string>> {
	const data: Record<string, string> = {
		service: loggerConfig.service,
		environment: sdkContext.env,
		sessionId: sdkContext.sessionId,
		"@version": packageJson.version,
		...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
	}
	if (sdkContext.providerId) {
		data.providerId = sdkContext.providerId
	}
	if (sdkContext.apiKey !== undefined) {
		data.apiKey = sdkContext.apiKey
	}
	return data
}

export type IGetSdkContext = () => Promise<Record<string, string>>

export type ExternalContext = {
	providerId?: string
}
