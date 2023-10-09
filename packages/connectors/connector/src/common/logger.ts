import type { LoggableValue } from "@rarible/logger/build/domain"
import { RemoteLogger } from "@rarible/logger/build"
import {
	getBlockchainByConnectorId, getFingerprint,
	isEVMWarning,
	isInfoLevel,
	isSolanaWarning,
	isTezosWarning,
} from "@rarible/sdk-common"
import { BlockchainGroup } from "@rarible/api-client"

const packageJson = require("../../package.json")

export const loggerConfig = {
	service: "wallet-connector",
	elkUrl: "https://logging.rarible.com/",
}

export function createLogger() {
	return new RemoteLogger(
		async (msg: LoggableValue) => {
			await window.fetch(loggerConfig.elkUrl, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(msg),
			})
		},
		{
			initialContext: createLoggerContext(),
			dropBatchInterval: 1000,
			maxByteSize: 3 * 10240,
		})
}

export enum LogLevelConnector {
	ERROR = "CONNECTOR_ERROR",
	WARNING = "CONNECTOR_WARNING",
	INFO = "CONNECTOR_INFO",
	SUCCESS = "CONNECTOR_SUCCESS"
}

export function getErrorLogLevel(
	error: any,
	providerId: string | undefined
) {
	if (!providerId) return LogLevelConnector.ERROR
	const blockchain = getBlockchainByConnectorId(providerId)
	if (isInfoLevel(error)) return LogLevelConnector.INFO
	if (blockchain === BlockchainGroup.ETHEREUM && isEVMWarning(error)) return LogLevelConnector.WARNING
	if (blockchain === BlockchainGroup.TEZOS && isTezosWarning(error)) return LogLevelConnector.WARNING
	if (blockchain === BlockchainGroup.SOLANA && isSolanaWarning(error)) return LogLevelConnector.WARNING
	return LogLevelConnector.ERROR
}

async function createLoggerContext(): Promise<Record<string, string>> {
	const fingerprint = await getFingerprint()

	return {
		service: loggerConfig.service,
		"@version": packageJson.version,
		environment: "prod",
		domain: window?.location?.host,
		fingerprint,
	}
}
