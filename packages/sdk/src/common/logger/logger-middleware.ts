import { NetworkError, RemoteLogger } from "@rarible/logger/build"
import type { AbstractLogger, LoggableValue } from "@rarible/logger/build/domain"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import axios from "axios"
import { getStringifiedData } from "@rarible/sdk-common"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"
import { LogsLevel } from "../../domain"
import { getSdkContext } from "../get-sdk-context"
import { getErrorLevel, getExecRevertedMessage } from "./logger-overrides"

export const loggerConfig = {
	service: "union-sdk",
	elkUrl: "https://logging.rarible.com/",
}

export async function getWalletInfo(wallet: BlockchainWallet): Promise<Record<string, string>> {
	const info: Record<string, any> = {
		"wallet.blockchain": wallet.walletType,
	}

	switch (wallet.walletType) {
		case WalletType.ETHEREUM:
			await Promise.allSettled([wallet.ethereum.getChainId(), wallet.ethereum.getFrom()])
				.then(([chainIdResult, addressResult]) => {
					info["wallet.address"] = addressResult.status === "fulfilled" ? addressResult?.value?.toLowerCase() : formatDefaultError(addressResult.reason)
					info["wallet.chainId"] = chainIdResult.status === "fulfilled" ? chainIdResult?.value : formatDefaultError(chainIdResult.reason)
				})
				.catch((err) => {
					info["wallet.address"] = formatDefaultError(err)
					info["wallet.address.error"] = getStringifiedData(err)
				})
			break
		case WalletType.FLOW:
			await wallet.fcl.currentUser().snapshot()
				.then((userData) => {
					info["wallet.address"] = userData.addr
					info["wallet.flow.chainId"] = userData.cid
				})
				.catch((err) => {
					info["wallet.address"] = formatDefaultError(err)
					info["wallet.address.error"] = getStringifiedData(err)
				})
			break
		case WalletType.TEZOS:
			info["wallet.tezos.kind"] = wallet.provider.kind
			await Promise.allSettled([wallet.provider.chain_id(), wallet.provider.address()])
				.then(([chainIdResult, addressResult]) => {
					info["wallet.address"] = addressResult.status === "fulfilled" ? addressResult.value : formatDefaultError(addressResult.reason)
					info["wallet.tezos.chainId"] = chainIdResult.status === "fulfilled" ? chainIdResult.value : formatDefaultError(chainIdResult.reason)
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

export function formatDefaultError(err: any) {
	return `unknown (${getErrorMessageString(err)})`
}

export function getErrorMessageString(err: any): string {
	try {
		if (!err) {
			return "not defined"
		} else if (typeof err === "string") {
			return err
		} else if (err instanceof Error) {
			return getExecRevertedMessage(err.message)
		} else if (err.message) {
			return typeof err.message === "string" ? getExecRevertedMessage(err.message) : JSON.stringify(err.message)
		} else if (err.status !== undefined && err.statusText !== undefined) {
			return JSON.stringify({
				url: err.url,
				status: err.status,
				statusText: err.statusText,
			})
		} else {
			return JSON.stringify(err)
		}
	} catch (e: any) {
		return `getErrorMessageString parse error: ${e?.message}`
	}
}

export function getInternalLoggerMiddleware(
	logsLevel: LogsLevel,
	sdkContext: ISdkContext,
	externalLogger?: AbstractLogger
): Middleware {
	const remoteLogger = externalLogger ?? new RemoteLogger(
		(msg: LoggableValue) => axios.post(loggerConfig.elkUrl, msg), {
			initialContext: getSdkContext(sdkContext),
			dropBatchInterval: 1000,
			maxByteSize: 3 * 10240,
		})

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
