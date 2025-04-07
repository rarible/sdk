import type { EthereumFunctionCall, EthereumSendOptions, EthereumTransaction } from "@rarible/ethereum-provider"
import { LogsLevel } from "../types"
import type { ILoggerConfig } from "./logger/logger"
import { getErrorMessageString } from "./logger/logger"
import { estimateGas } from "./estimate-gas"
export type SendFunction = (
  functionCall: EthereumFunctionCall,
  options?: EthereumSendOptions,
) => Promise<EthereumTransaction>

type SendMethod = (functionCall: EthereumFunctionCall, options?: EthereumSendOptions) => Promise<EthereumTransaction>

export function getSendWithInjects(
  injects: {
    logger?: ILoggerConfig
  } = {},
): SendMethod {
  const logger = injects.logger

  return async function send(
    functionCall: EthereumFunctionCall,
    options?: EthereumSendOptions,
  ): Promise<EthereumTransaction> {
    const callInfo = await functionCall.getCallInfo()

    try {
      await estimateGas(functionCall, { from: callInfo.from, value: options?.value }, logger)
    } catch (err) {}

    try {
      const tx = await functionCall.send(options)
      try {
        if (logger?.level && logger.level >= LogsLevel.TRACE) {
          logger.instance.raw({
            level: "TRACE",
            method: callInfo.method,
            message: JSON.stringify(getTxData(tx)),
            args: JSON.stringify(callInfo.args),
            provider: callInfo.provider,
            to: callInfo.contract,
            value: options?.value,
          })
        }
      } catch (e) {
        console.error("Error while sending logs", e)
      }
      return tx
    } catch (err: any) {
      try {
        if (logger?.level && logger.level >= LogsLevel.ERROR) {
          let data = undefined
          try {
            data = await functionCall.getData()
          } catch (e: any) {
            console.error("Unable to get tx data for log", e)
          }

          logger.instance.raw({
            level: "ERROR",
            method: callInfo.method,
            message: getErrorMessageString(err),
            from: callInfo.from,
            provider: callInfo.provider,
            args: JSON.stringify(callInfo.args),
            to: callInfo.contract,
            value: options?.value,
            data,
          })
        }
      } catch (e) {
        console.error("Error while sending logs", e, err)
      }
      throw err
    }
  }
}

type SimpleSendMethod = (
  functionCall: EthereumFunctionCall,
  options?: EthereumSendOptions,
) => Promise<EthereumTransaction>

export function getSimpleSendWithInjects(
  injects: {
    logger?: ILoggerConfig
  } = {},
): SimpleSendMethod {
  const logger = injects.logger

  return async function simpleSend(functionCall: EthereumFunctionCall, options?: EthereumSendOptions) {
    const callInfo = await functionCall.getCallInfo()

    try {
      await estimateGas(functionCall, { from: callInfo.from, value: options?.value }, logger)
    } catch (err) {}

    try {
      const tx = await functionCall.send(options)
      try {
        if (logger?.level && logger.level >= LogsLevel.TRACE) {
          logger.instance.raw({
            level: "TRACE",
            method: callInfo.method,
            from: callInfo.from,
            provider: callInfo.provider,
            args: JSON.stringify(callInfo.args),
            message: JSON.stringify(getTxData(tx)),
            to: callInfo.contract,
            value: options?.value,
          })
        }
      } catch (e) {
        console.error("Error while sending logs", e)
      }
      return tx
    } catch (err: any) {
      try {
        if (logger?.level && logger.level >= LogsLevel.ERROR && callInfo) {
          logger.instance.raw({
            level: "ERROR",
            method: callInfo.method,
            from: callInfo.from,
            provider: callInfo.provider,
            args: JSON.stringify(callInfo.args),
            error: getErrorMessageString(err),
            to: callInfo.contract,
            value: options?.value,
          })
        }
      } catch (e) {
        console.error("Error while sending logs", e, err)
      }
      throw err
    }
  }
}

function getTxData(tx: EthereumTransaction) {
  return {
    hash: tx.hash,
    data: tx.data,
    from: tx.from,
    to: tx.to,
  }
}
