import { NetworkError, RemoteLogger, Warning } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import axios from "axios"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"
import { LogsLevel } from "../../domain"
import { NetworkErrorCode } from "../apis"

const packageJson = require("../../../package.json")
const loggerConfig = {
	service: "union-sdk",
	elkUrl: "https://logging.rarible.com/",
}

async function getWalletInfo(wallet: BlockchainWallet): Promise<Record<string, string>> {
	const info: Record<string, any> = {
		"wallet.blockchain": wallet.walletType,
	}

	switch (wallet.walletType) {
		case WalletType.ETHEREUM:
			await Promise.all([wallet.ethereum.getChainId(), wallet.ethereum.getFrom()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case WalletType.FLOW:
			await wallet.fcl.currentUser().snapshot()
				.then((userData) => {
					info["wallet.address"] = userData.addr
					info["wallet.flow.chainId"] = userData.cid
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case WalletType.TEZOS:
			info["wallet.tezos.kind"] = wallet.provider.kind
			await Promise.all([wallet.provider.chain_id(), wallet.provider.address()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.tezos.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case WalletType.SOLANA:
			info["wallet.address"] = wallet.provider.publicKey?.toString()
			break
		case WalletType.IMMUTABLEX:
			const data = wallet.wallet.getConnectionData()
			info["wallet.address"] = data.address
			info["wallet.network"] = data.ethNetwork
			info["wallet.starkPubkey"] = data.starkPublicKey
			break
		default:
			info["wallet.address"] = "unknown"
	}

	return info
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

export type ErrorLevel = LogLevel | NetworkErrorCode | string

export function getErrorLevel(callableName: string, error: any, wallet: BlockchainWallet | undefined): ErrorLevel {
	if (error instanceof NetworkError) {
		return error.code || NetworkErrorCode.NETWORK_ERR
	}
	if (callableName.startsWith("apis.")) {
		return NetworkErrorCode.NETWORK_ERR
	}
	if (isCancelledTx(error, wallet?.walletType) || error instanceof Warning) {
		return LogLevel.WARN
	}
	return LogLevel.ERROR
}

function isCancelledTx(err: any, blockchain: WalletType | undefined): boolean {
	if (!err) {
		return false
	}

	if (blockchain === WalletType.ETHEREUM || blockchain === WalletType.IMMUTABLEX) {
		if (
			err.message?.includes("User denied transaction signature") ||
      err.message?.includes("User denied message signature") ||
      err.message?.includes("User rejected the transaction") ||
      err.message?.includes("Sign transaction cancelled")
		) {
			return true
		}
	}

	if (blockchain === WalletType.TEZOS) {
		if (err.name === "UnknownBeaconError" && err?.title === "Aborted") {
			return true
		}
	}

	if (blockchain === WalletType.SOLANA) {
		if (err.name === "User rejected the request.") {
			return true
		}
	}

	return false
}

function getStringifiedError(error: any): string | undefined {
	try {
		const errorObject = Object.getOwnPropertyNames(error)
			.reduce((acc, key) => {
				acc[key] = error[key]
				return acc
			}, {} as Record<any, any>)
		return JSON.stringify(errorObject, null, "  ")
	} catch (e) {
		return undefined
	}
}

export function getInternalLoggerMiddleware(logsLevel: LogsLevel, sdkContext: ISdkContext): Middleware {
	const getContext = async () => {
		return {
			service: loggerConfig.service,
			environment: sdkContext.env,
			sessionId: sdkContext.sessionId,
			"@version": packageJson.version,
			...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
		}
	}

	const remoteLogger = new RemoteLogger((msg: LoggableValue) => axios.post(loggerConfig.elkUrl, msg), {
		initialContext: getContext(),
		dropBatchInterval: 1000,
		maxByteSize: 3 * 10240,
	})

	return async (callable, args) => {
		const time = Date.now()

		return [callable, async (responsePromise) => {
			try {
				const res = await responsePromise
				if (logsLevel >= LogsLevel.TRACE) {
					remoteLogger.raw({
						level: LogLevel.TRACE,
						method: callable.name,
						message: "trace of " + callable.name,
						duration: (Date.now() - time) / 1000,
						args: JSON.stringify(args),
						resp: JSON.stringify(res),
					})
				}
			} catch (err: any) {
				if (logsLevel >= LogsLevel.ERROR) {
					const data = {
						level: getErrorLevel(callable.name, err, sdkContext.wallet),
						method: callable.name,
						message: getErrorMessageString(err),
						error: getStringifiedError(err),
						duration: (Date.now() - time) / 1000,
						args: JSON.stringify(args),
						requestAddress: undefined as undefined | string,
					}
					if (err instanceof NetworkError) {
						data.requestAddress = err.url
					}
					remoteLogger.raw(data)
				}
			}

			return responsePromise
		}]
	}
}
