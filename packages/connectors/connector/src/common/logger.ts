import type { LoggableValue } from "@rarible/logger/build/domain"
import { RemoteLogger } from "@rarible/logger/build"
import { getBlockchainByConnectorId, isEVMWarning, isSolanaWarning, isTezosWarning } from "@rarible/sdk-common"
import { BlockchainGroup } from "@rarible/api-client"

const packageJson = require("../../package.json")

export const loggerConfig = {
	service: "wallet-connector",
	elkUrl: "https://logging.rarible.com/",
}

export function createLogger() {
	return new RemoteLogger(
		async (msg: LoggableValue) => {
			await fetch(loggerConfig.elkUrl, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(msg),
			})
		},
		{
			initialContext: Promise.resolve({
				service: loggerConfig.service,
				"@version": packageJson.version,
				environment: "testnet",
			}),
			dropBatchInterval: 1000,
			maxByteSize: 3 * 10240,
		})
}

export enum LogLevelConnector {
	ERROR = "CONNECTOR_ERROR",
	WARNING = "CONNECTOR_WARNING",
	SUCCESS = "CONNECTOR_SUCCESS"
}

export function getErrorLogLevel(
	error: any,
	providerId: string | undefined
) {
	if (!providerId) return LogLevelConnector.ERROR
	const blockchain = getBlockchainByConnectorId(providerId)
	if (blockchain === BlockchainGroup.ETHEREUM && isEVMWarning(error)) return LogLevelConnector.WARNING
	if (blockchain === BlockchainGroup.TEZOS && isTezosWarning(error)) return LogLevelConnector.WARNING
	if (blockchain === BlockchainGroup.SOLANA && isSolanaWarning(error)) return LogLevelConnector.WARNING
	return LogLevelConnector.ERROR
}
