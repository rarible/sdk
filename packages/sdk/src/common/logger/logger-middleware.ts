import { RemoteLogger } from "@rarible/logger/build"
import type { AbstractLogger, LoggableValue } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import axios from "axios"
import {
	UserCancelError,
	promiseSettledRequest,
	isCancelCode,
	isCancelMessage,
} from "@rarible/sdk-common"
import { WrappedError, INVALID_TX_PARAMS_EIP_1559_ERROR } from "@rarible/sdk-common"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"
import { LogsLevel } from "../../domain"
import { getSdkContext } from "../get-sdk-context"
import { WrappedAdvancedFn } from "../middleware/middleware"
import type { PrepareFillRequest } from "../../types/order/fill/domain"
import { getCollectionFromItemId, getContractFromMintRequest, getOrderIdFromFillRequest } from "../utils"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type { PrepareOrderUpdateRequest } from "../../types/order/common"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { PrepareOrderRequest } from "../../types/order/common"
import type { PrepareBatchBuyResponse } from "../../types/order/fill/domain"
import type { PrepareTransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareBurnRequest } from "../../types/nft/burn/domain"
import { getExecRevertedMessage, LoggerDataContainer } from "./logger-overrides"

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

		return [callable, async (responsePromise) => {
			let wrappedError: Error | undefined

			const dataContainer = new LoggerDataContainer({
				args,
				callable,
				responsePromise,
				sdkContext,
				startTime: time,
			})
			try {
				await responsePromise
				if (logsLevel >= LogsLevel.TRACE) {
					remoteLogger.raw(await dataContainer.getTraceData())
				}
			} catch (err: any) {
				wrappedError = wrapSpecialErrors(err)

				if (logsLevel >= LogsLevel.ERROR) {
					remoteLogger.raw(dataContainer.getErrorData(wrappedError || err))
				}
			}
			return wrappedError ? responsePromise.catch(() => { throw wrappedError })
				: responsePromise

		}]
	}
}
function isCallable(fn: any): fn is WrappedAdvancedFn {
	return fn instanceof WrappedAdvancedFn || fn?.constructor?.name === "WrappedAdvancedFn"
}
export function getCallableExtraFields(callable: any): Record<string, string | undefined> {
	try {
		if (typeof callable?.name !== "string") return {}
		if (isCallable(callable)) {
			const parent = callable.parent

			if (callable?.name.startsWith("order.buy.prepare.submit")) {
				const request: PrepareFillRequest | undefined = parent?.args[0]
				const orderId = getOrderIdFromFillRequest(request)
				return {
					orderId,
					platform: parent?.context?.orderData?.platform,
					collectionId: parent?.context?.orderData?.nftCollection,
				}
			}

			if (callable?.name.startsWith("order.batchBuy.prepare.submit")) {
				const request: PrepareFillRequest[] | undefined = parent?.args[0]
				const orderIds = Array.isArray(request)
					? request.map(req => getOrderIdFromFillRequest(req))
						.join(",")
					: null
				const contextData = parent?.context as PrepareBatchBuyResponse | undefined
				const platforms = Array.isArray(contextData?.prepared)
					? contextData?.prepared.reduce((acc, req) => {
						if (req?.orderData?.platform && !acc.includes(req?.orderData?.platform)) {
							acc.push(req.orderData.platform)
						}
						return acc
					}, [] as string[])
						.join(",")
					: null

				const collections = Array.isArray(contextData?.prepared)
					? contextData?.prepared.reduce((acc, req) => {
						if (req?.orderData?.nftCollection && !acc.includes(req?.orderData?.nftCollection)) {
							acc.push(req.orderData.nftCollection)
						}
						return acc
					}, [] as string[])
						.join(",")
					: null
				return {
					orderId: `[${orderIds}]`,
					platform: `[${platforms}]`,
					collectionId: `[${collections}]`,
				}
			}

			if (callable?.name.startsWith("order.bid.prepare.submit")) {
				const request: PrepareBidRequest | undefined = parent?.args[0]
				if (!request) return {}
				return {
					itemId: "itemId" in request ? request.itemId : undefined,
					collectionId: "collectionId" in request ? request.collectionId : getCollectionFromItemId(request.itemId),
				}
			}

			if (callable?.name.startsWith("order.bidUpdate.prepare.submit")) {
				const request: PrepareOrderUpdateRequest | undefined = parent?.args[0]
				return { orderId: request?.orderId }
			}

			if (callable?.name.startsWith("order.cancel")) {
				const request: CancelOrderRequest | undefined = parent?.args[0]
				return { orderId: request?.orderId }
			}

			if (callable?.name.startsWith("order.sell.prepare.submit")) {
				const request: PrepareOrderRequest | undefined = parent?.args[0]
				return {
					itemId: request?.itemId,
					collectionId: request ? getCollectionFromItemId(request.itemId) : undefined,
				}
			}

			if (callable?.name.startsWith("order.sellUpdate.prepare.submit")) {
				const request: PrepareOrderUpdateRequest | undefined = parent?.args[0]
				return {
					orderId: request?.orderId,
					collectionId: parent?.context?.orderData?.nftCollection,
				}
			}

			if (callable?.name.startsWith("order.acceptBid.prepare.submit")) {
				const request: PrepareFillRequest | undefined = parent?.args[0]
				let orderId = getOrderIdFromFillRequest(request)

				return {
					orderId,
					collectionId: parent?.context?.orderData?.nftCollection,
				}
			}

			if (callable?.name.startsWith("nft.transfer.prepare.submit")) {
				const request: PrepareTransferRequest | undefined = parent?.args[0]
				if (request?.itemId) {
					return {
						collectionId: getCollectionFromItemId(request.itemId),
					}
				}
			}

			if (callable?.name.startsWith("nft.mint.prepare.submit")) {
				const request: PrepareMintRequest | undefined = parent?.args[0]
				if (request) {
					return {
						collectionId: getContractFromMintRequest(request),
					}
				}
			}

			if (callable?.name.startsWith("nft.burn.prepare.submit")) {
				const request: PrepareBurnRequest | undefined = parent?.args[0]
				if (request) {
					return {
						collectionId: getCollectionFromItemId(request.itemId),
					}
				}
			}

		}
	} catch (e) {}
	return {}
}

function wrapSpecialErrors(err: any): WrappedError | undefined {
	if (isCancelMessage(err?.message) || isCancelCode(err?.error?.code)) {
		return new UserCancelError(err)
	}
	if (err?.message?.includes(INVALID_TX_PARAMS_EIP_1559_ERROR)) {
		return new WrappedError(HUMAN_READABLE_MSG_LIST[INVALID_TX_PARAMS_EIP_1559_ERROR], err)
	}
}

export const HUMAN_READABLE_MSG_LIST: Record<string, string> = {
	[INVALID_TX_PARAMS_EIP_1559_ERROR]: "The problem is with the selected network of your wallet provider, try switching the network or re-entering the wallet. You can read more about this error [here](https://github.com/MetaMask/metamask-extension/issues/13341)",
}
