import type { ISdkContext } from "../domain"
import { getWalletInfo, loggerConfig } from "./logger/logger-middleware"
const packageJson = require("../../package.json")

export async function getSdkContext(sdkContext: ISdkContext): Promise<Record<string, string>> {
	return {
		service: loggerConfig.service,
		environment: sdkContext.env,
		sessionId: sdkContext.sessionId,
		"@version": packageJson.version,
		...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
	}
}

export type IGetSdkContext = () => Promise<Record<string, string>>
