import type { ISdkContext } from "../domain"
import { getWalletInfo, loggerConfig } from "./logger/logger-middleware"
const packageJson = require("../../package.json")

export async function getSdkContext(sdkContext: ISdkContext): Promise<IGetSdkContextResult> {
	const data: IGetSdkContextResult = {
		service: loggerConfig.service,
		environment: sdkContext.env,
		sessionId: sdkContext.sessionId,
		"@version": packageJson.version,
		...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
	}
	if (sdkContext.providerId !== undefined) {
		data.providerId = sdkContext.providerId
	}
	if (sdkContext.providerMeta !== undefined) {
		data.providerMeta = sdkContext.providerMeta
	}
	if (sdkContext.apiKey !== undefined) {
		data.apiKey = sdkContext.apiKey
	}
	return data
}

export type ExternalContext = {
	providerId?: string
	providerMeta?: Record<string, string>
}
export type IGetSdkContextResult = Record<string, string> & ExternalContext
export type IGetSdkContext = () => Promise<IGetSdkContextResult>
