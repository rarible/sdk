import type { LoggableValue } from "@rarible/logger/build/domain"
import { RemoteLogger } from "@rarible/logger/build"
import {
  getBlockchainByConnectorId,
  isEVMWarning,
  isInfoLevel,
  isSolanaWarning,
  isTezosWarning,
  retry,
} from "@rarible/sdk-common"
import { BlockchainGroup } from "@rarible/api-client"
import type { Fingerprint } from "./fingerprint"
import { getFingerprint } from "./fingerprint"

const packageJson = require("../../package.json")

export const loggerConfig = {
  service: "wallet-connector",
  elkUrl: "https://logging.rarible.com/",
}

export function createLogger(environment: Environment, fingerprint?: Fingerprint) {
  return new RemoteLogger(
    async (msg: LoggableValue) => {
      try {
        await retry(5, 2000, () =>
          window.fetch(loggerConfig.elkUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(msg),
          }),
        )
      } catch (_) {}
    },
    {
      initialContext: createLoggerContext(environment, fingerprint),
      dropBatchInterval: 1000,
      maxByteSize: 3 * 10240,
    },
  )
}

export enum LogLevelConnector {
  ERROR = "CONNECTOR_ERROR",
  WARNING = "CONNECTOR_WARNING",
  INFO = "CONNECTOR_INFO",
  SUCCESS = "CONNECTOR_SUCCESS",
}

export function getErrorLogLevel(error: any, providerId: string | undefined) {
  if (!providerId) return LogLevelConnector.ERROR
  const blockchain = getBlockchainByConnectorId(providerId)
  if (isInfoLevel(error)) return LogLevelConnector.INFO
  if (blockchain === BlockchainGroup.ETHEREUM && isEVMWarning(error)) return LogLevelConnector.WARNING
  if (blockchain === BlockchainGroup.TEZOS && isTezosWarning(error)) return LogLevelConnector.WARNING
  if (blockchain === BlockchainGroup.SOLANA && isSolanaWarning(error)) return LogLevelConnector.WARNING
  return LogLevelConnector.ERROR
}

export type Environment = "prod" | "testnet" | "dev"

async function createLoggerContext(
  environment: Environment,
  fingerprint?: Fingerprint,
): Promise<Record<string, string>> {
  const fallbackFingerprint = await getFingerprint()

  return {
    service: loggerConfig.service,
    "@version": packageJson.version,
    environment,
    domain: window?.location?.host,
    fingerprint: fingerprint ?? fallbackFingerprint,
  }
}
