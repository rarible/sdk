import { NetworkError, Warning } from "@rarible/logger/build"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import {
  getStringifiedData,
  isEVMWarning,
  isFlowWarning,
  isInfoLevel,
  isSolanaWarning,
  isTezosWarning,
  WrappedError,
} from "@rarible/sdk-common"
import { NetworkErrorCode } from "../apis"
import type { ISdkContext } from "../../domain"
import type { PrepareBatchBuyResponse, PrepareFillRequest } from "../../types/order/fill/domain"
import { getCollectionFromItemId, getContractFromMintRequest, getOrderIdFromFillRequest } from "../utils"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type {
  PrepareOrderRequest,
  PrepareOrderUpdateRequest,
  PrepareOrderUpdateResponse,
} from "../../types/order/common"
import type { CancelOrderRequest } from "../../types/order/cancel/domain"
import type { PrepareTransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareBurnRequest } from "../../types/nft/burn/domain"
import { WrappedAdvancedFn } from "../middleware/middleware"
import type { PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { PrepareTransferResponse } from "../../types/nft/transfer/domain"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { PrepareFillResponse } from "../../types/order/fill/domain"
import { getErrorMessageString } from "./logger-middleware"

const COMMON_NETWORK_ERROR_MESSAGES = ["Network request failed", "Failed to fetch"]

/**
 * Checks if given error may consider as warning level
 * @param err
 * @param blockchain
 */
export function isErrorWarning(err: any, blockchain: WalletType | undefined): boolean {
  try {
    if (!err) {
      return false
    }

    if (isEVMWalletType(blockchain)) {
      if (isEVMWarning(err)) {
        return true
      }
    }

    if (blockchain === WalletType.TEZOS) {
      return isTezosWarning(err)
    }

    if (blockchain === WalletType.FLOW) {
      return isFlowWarning(err)
    }

    if (blockchain === WalletType.SOLANA) {
      if (isSolanaWarning(err)) {
        return true
      }
    }
  } catch (e) {}

  return false
}

function isNetworkError(callableName: string, error: any): boolean {
  if (callableName?.startsWith("apis.")) {
    return true
  }

  return COMMON_NETWORK_ERROR_MESSAGES.some(msg => error?.message?.includes(msg))
}

export type ErrorLevel = LogLevel | NetworkErrorCode | CustomErrorCode | string

export enum CustomErrorCode {
  CONTRACT_ERROR = "CONTRACT_ERROR",
}

export function getErrorLevel(callableName: string, error: any, wallet: BlockchainWallet | undefined): ErrorLevel {
  if (error?.status === 400) {
    //if user's network request is not correct
    return LogLevel.WARN
  }

  if (error instanceof NetworkError || error?.name === "NetworkError") {
    return error?.code || NetworkErrorCode.NETWORK_ERR
  }

  if (isNetworkError(callableName, error)) {
    return NetworkErrorCode.NETWORK_ERR
  }

  if (isInfoLevel(error)) {
    return LogLevel.INFO
  }

  if (isErrorWarning(error, wallet?.walletType) || error instanceof Warning || error?.name === "Warning") {
    return LogLevel.WARN
  }

  if (isEVMWalletType(wallet?.walletType) && isContractError(error)) {
    return CustomErrorCode.CONTRACT_ERROR
  }

  return LogLevel.ERROR
}

function isEVMWalletType(walletType: WalletType | undefined) {
  return walletType === WalletType.ETHEREUM || walletType === WalletType.IMMUTABLEX
}

const execRevertedRegexp = /execution reverted:(.*[^\\])/
const ethersSig = "Error while gas estimation with message cannot estimate gas"
const ethersRevertedRegexp = /"execution reverted[:]?(.*?)"/

function isContractError(error: any): boolean {
  return error?.message?.includes("execution reverted")
}

export function getExecRevertedMessage(msg: string) {
  if (!msg) return msg
  try {
    const result = msg.includes(ethersSig) ? msg.match(ethersRevertedRegexp) : msg.match(execRevertedRegexp)
    if (result && result[1]) {
      return result[1].trim()
    }
  } catch (e) {}

  return msg
}

export type LoggerDataContainerInput = {
  callable: (...args: any[]) => any
  args: any[]
  responsePromise: Promise<any>
  startTime: number
  sdkContext: ISdkContext
}
export class LoggerDataContainer {
  extraFields: Record<string, string | undefined>
  stringifiedArgs: string
  constructor(private input: LoggerDataContainerInput) {
    this.extraFields = getCallableExtraFields(input.callable)
    this.stringifiedArgs = LoggerDataContainer.getParsedArgs(input.args)
  }

  static getParsedArgs(args: any[]) {
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
    return parsedArgs
  }
  async getTraceData(additionalFields?: Record<string, any>) {
    const res = await this.input.responsePromise
    return {
      level: LogLevel.TRACE,
      method: this.input.callable.name,
      message: "trace of " + this.input.callable.name,
      duration: (Date.now() - this.input.startTime) / 1000,
      args: this.stringifiedArgs,
      resp: JSON.stringify(res),
      ...(this.extraFields || {}),
      ...(additionalFields || {}),
    }
  }

  getErrorData<T extends Error | WrappedError>(rawError: T, additionalFields?: Record<string, any>) {
    let data
    const error = WrappedError.isWrappedError(rawError) ? (rawError.error as Error) : rawError
    try {
      data = {
        level: getErrorLevel(this.input.callable?.name, error, this.input.sdkContext?.wallet),
        method: this.input.callable?.name,
        message: getErrorMessageString(error),
        error: getStringifiedData(error),
        duration: (Date.now() - this.input.startTime) / 1000,
        args: this.stringifiedArgs,
        requestAddress: undefined as undefined | string,
        ...(this.extraFields || {}),
        ...(additionalFields || {}),
      }
      if (error instanceof NetworkError || error?.name === "NetworkError") {
        data.requestAddress = (error as NetworkError)?.url
      }
    } catch (e) {
      data = {
        level: "LOGGING_ERROR",
        method: this.input.callable?.name,
        message: getErrorMessageString(e),
        error: getStringifiedData(e),
      }
    }

    return data
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
        const contextData = parent?.context as PrepareFillResponse | undefined
        return {
          orderId,
          platform: contextData?.orderData?.platform,
          collectionId: contextData?.orderData?.nftCollection,
        }
      }

      if (callable?.name.startsWith("order.batchBuy.prepare.submit")) {
        const request: PrepareFillRequest[] | undefined = parent?.args[0]
        const orderIds = Array.isArray(request) ? request.map(req => getOrderIdFromFillRequest(req)).join(",") : null
        const contextData = parent?.context as PrepareBatchBuyResponse | undefined
        const platforms = Array.isArray(contextData?.prepared)
          ? contextData?.prepared
              .reduce((acc, req) => {
                if (req?.orderData?.platform && !acc.includes(req?.orderData?.platform)) {
                  acc.push(req.orderData.platform)
                }
                return acc
              }, [] as string[])
              .join(",")
          : null

        const collections = Array.isArray(contextData?.prepared)
          ? contextData?.prepared
              .reduce((acc, req) => {
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
        const contextData = parent?.context as PrepareBidResponse | undefined

        if (!request) return {}
        return {
          itemId: "itemId" in request ? request.itemId : undefined,
          collectionId: contextData?.nftData.nftCollection,
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
        const contextData = parent?.context as PrepareOrderUpdateResponse | undefined

        return {
          orderId: request?.orderId,
          collectionId: contextData?.orderData.nftCollection,
        }
      }

      if (callable?.name.startsWith("order.acceptBid.prepare.submit")) {
        const request: PrepareFillRequest | undefined = parent?.args[0]
        let orderId = getOrderIdFromFillRequest(request)
        const contextData = parent?.context as PrepareBidResponse | undefined

        return {
          orderId,
          collectionId: contextData?.nftData.nftCollection,
        }
      }

      if (callable?.name.startsWith("nft.transfer.prepare.submit")) {
        const request: PrepareTransferRequest | undefined = parent?.args[0]
        const contextData = parent?.context as PrepareTransferResponse | undefined

        if (request?.itemId) {
          return {
            collectionId: contextData?.nftData.nftCollection || getCollectionFromItemId(request.itemId),
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
        const contextData = parent?.context as PrepareBurnResponse | undefined
        if (request) {
          return {
            collectionId: contextData?.nftData.nftCollection || getCollectionFromItemId(request.itemId),
          }
        }
      }
    }
  } catch (e) {}
  return {}
}
