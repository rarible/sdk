import axios from "axios"
import { RemoteLogger } from "@rarible/logger/build"
import { getRandomId } from "@rarible/utils"
import type { AbstractLogger } from "@rarible/logger/build/domain"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "../../types"
import type { LogsLevel } from "../../types"

type Environment = "prod" | "testnet" | "dev" | "staging"

/**
 * Convert network name to stage environment name
 *
 * @param network
 */
export function getEnvironment(network: EthereumNetwork): Environment {
	switch (network) {
		case "mainnet":
		case "polygon":
			return "prod"
		case "mumbai":
			return "staging"
		case "testnet":
		default:
			return "testnet"
	}
}

const loggerConfig = {
	service: "ethereum-sdk",
	elkUrl: "https://logging.rarible.com/",
}

export function getErrorMessageString(err: any): string {
	if (!err) {
		return "not defined"
	} else if (typeof err === "string") {
		return err
	} else if (err instanceof Error) {
		return err.message
	} else if (err.message) {
		return typeof err.message === "string" ? err.message : JSON.stringify(err.message)
	} else if (err.status !== undefined && err.statusText !== undefined) {
		return JSON.stringify({
			url: err.url,
			status: err.status,
			statusText: err.statusText,
		})
	} else {
		return JSON.stringify(err)
	}
}

export function createRemoteLogger(context: {
	ethereum: Maybe<Ethereum>,
	env: Environment,
	sessionId?: string,
	apiKey?: string,
}): RemoteLogger {
	const getContext = async () => {
		const data: Record<string, string> = {
			service: loggerConfig.service,
			environment: context.env,
			sessionId: context.sessionId ?? getRandomId("ethereum"),
			"web3Address": (await context.ethereum?.getFrom()) ?? "unknown",
			"ethNetwork": (await context.ethereum?.getChainId())?.toString() ?? "unknown",
		}
		if (context.apiKey !== undefined) {
			data.apiKey = context.apiKey
		}
		return data
	}

	return new RemoteLogger((msg) => axios.post(loggerConfig.elkUrl, msg), {
		initialContext: getContext(),
		maxByteSize: 5 * 10240,
	})
}

export interface ILoggerConfig {
	instance: AbstractLogger
	level: LogsLevel
}

export enum NetworkErrorCode {
	ETHEREUM_EXTERNAL_ERR = "ETHEREUM_EXTERNAL_ERR"
}
