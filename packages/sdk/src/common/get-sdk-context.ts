import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { RemoteLogger } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import axios from "axios"
import type { RaribleSdkEnvironment } from "../config/domain"
import type { IRaribleSdkConfig } from "../types/sdk-config"
import { getWalletInfo } from "./get-wallet-info"

const packageJson = require("../../package.json")

export const loggerConfig = {
	service: "union-sdk",
	elkUrl: "https://logging.rarible.com/",
}

export async function getSdkContext(sdkContext: ISdkContext): Promise<Record<string, string>> {
	const data: Record<string, string> = {
		service: loggerConfig.service,
		environment: sdkContext.env,
		sessionId: sdkContext.sessionId,
		"@version": packageJson.version,
		...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
	}
	if (sdkContext.apiKey !== undefined) {
		data.apiKey = sdkContext.apiKey
	}
	return data
}

export function getRemoteLogger(sdkContext: ISdkContext) {
	return new RemoteLogger(
		(msg: LoggableValue) => axios.post(loggerConfig.elkUrl, msg), {
			initialContext: getSdkContext(sdkContext),
			dropBatchInterval: 1000,
			maxByteSize: 3 * 10240,
		})
}

export type IGetSdkContext = () => Promise<Record<string, string>>

export interface ISdkContext {
	wallet?: BlockchainWallet,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
	sessionId: string
	apiKey?: string
}
