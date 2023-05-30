import { NetworkError, RemoteLogger } from "@rarible/logger/build"
import type { AbstractLogger, LoggableValue } from "@rarible/logger/build/domain"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import axios from "axios"
import { getStringifiedData, promiseSettledRequest } from "@rarible/sdk-common"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"
import { LogsLevel } from "../../domain"
import { getSdkContext } from "../get-sdk-context"
import { WrappedAdvancedFn } from "../middleware/middleware"
import type { PrepareFillRequest } from "../../types/order/fill/domain"
import { getOrderIdFromFillRequest } from "../utils"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type { PrepareOrderUpdateRequest } from "../../types/order/common"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { PrepareOrderRequest } from "../../types/order/common"
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
		case WalletType.ETHEREUM: {
			const [chainIdResult, addressResult] = await Promise.allSettled([
				wallet.ethereum.getChainId(),
				wallet.ethereum.getFrom(),
			])
			info["wallet.address"] = addressResult.status === "fulfilled" ? addressResult?.value?.toLowerCase() : formatDefaultError(addressResult.reason)
			info["wallet.chainId"] = chainIdResult.status === "fulfilled" ? chainIdResult?.value : formatDefaultError(chainIdResult.reason)
			break
		}
		case WalletType.FLOW: {
			const [userData, authResult] = await promiseSettledRequest([
				wallet.fcl.currentUser().snapshot(),
				typeof wallet.auth === "function" ? wallet.auth() : undefined,
			])
			info["wallet.address"] = userData?.addr || authResult?.addr
			info["wallet.flow.chainId"] = userData?.cid
			break
		}
		case WalletType.TEZOS: {
			info["wallet.tezos.kind"] = wallet.provider.kind
			const [chainIdResult, addressResult] = await Promise.allSettled([
				wallet.provider.chain_id(),
				wallet.provider.address(),
			])
			info["wallet.address"] = addressResult.status === "fulfilled" ? addressResult.value : formatDefaultError(addressResult.reason)
			info["wallet.tezos.chainId"] = chainIdResult.status === "fulfilled" ? chainIdResult.value : formatDefaultError(chainIdResult.reason)
			break
		}
		case WalletType.SOLANA: {
			info["wallet.address"] = wallet.provider.publicKey?.toString()
			break
		}
		case WalletType.IMMUTABLEX: {
			const data = wallet.wallet.getConnectionData()
			info["wallet.address"] = data.address
			info["wallet.network"] = data.ethNetwork
			info["wallet.starkPubkey"] = data.starkPublicKey
			break
		}
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

		console.log("args", args)
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
			const logDataExtraFields = getCallableExtraFields(callable)
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
						...(logDataExtraFields || {}),
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
							...(logDataExtraFields || {}),
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

export function getCallableExtraFields(callable: any): Record<string, string | undefined> {
	try {
		if (typeof callable?.name !== "string") return {}
		if (callable instanceof WrappedAdvancedFn || callable?.constructor?.name === "WrappedAdvancedFn") {
			console.log("getCallableExtraFields")
			console.dir(callable)

			if (callable?.name.startsWith("order.buy.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareFillRequest
				const orderId = getOrderIdFromFillRequest(request)
				return {
					orderId,
					platform: (request as any).platform,
				}
			}
			if (callable?.name.startsWith("order.batchBuy.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareFillRequest[]
				const orderIds = Array.isArray(request)
					? request.map(req => getOrderIdFromFillRequest(req))
						.join(",")
					: null
				return {
					orderId: `[${orderIds}]`,
				}
			}

			if (callable?.name.startsWith("order.bid.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareBidRequest
				if ("collectionId" in request) {
					return { collectionId: request.collectionId }
				} else if ("itemId" in request) {
					return { itemId: request.itemId }
				}
			}

			if (callable?.name.startsWith("order.bidUpdate.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareOrderUpdateRequest
				return { orderId: request.orderId }
			}

			if (callable?.name.startsWith("order.cancel")) {
				const request = callable.parent?.args[0] as CancelOrderRequest
				return { orderId: request.orderId }
			}

			if (callable?.name.startsWith("order.sell.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareOrderRequest
				return { itemId: request.itemId }
			}
			if (callable?.name.startsWith("order.sellUpdate.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareOrderUpdateRequest
				return { orderId: request.orderId }
			}

			if (callable?.name.startsWith("order.acceptBid.prepare.submit")) {
				const request = callable.parent?.args[0] as PrepareFillRequest
				let orderId = getOrderIdFromFillRequest(request)
				return { orderId }
			}
		}
	} catch (e) {

	}
	return {}
}
