import type { EthereumFunctionCall } from "@rarible/ethereum-provider"
import type { EthereumEstimateGasOptions } from "@rarible/ethereum-provider"
import { LogsLevel } from "../types"
import type { ILoggerConfig } from "./logger/logger"
import { getErrorMessageString } from "./logger/logger"

export async function estimateGas(
  functionCall: EthereumFunctionCall,
  options?: EthereumEstimateGasOptions,
  logger?: ILoggerConfig,
): Promise<number> {
  try {
    return await functionCall.estimateGas(options)
  } catch (err: any) {
    try {
      const callInfo = await functionCall.getCallInfo()
      if (logger?.level && logger.level >= LogsLevel.ERROR) {
        let data = undefined
        try {
          data = await functionCall.getData()
        } catch (e: any) {
          console.error("Unable to get tx data for log", e)
        }

        const logData = {
          level: "ESTIMATE_GAS_ERRORS",
          method: `${callInfo.method}.estimateGas`,
          message: getErrorMessageString(err),
          from: callInfo.from,
          provider: callInfo.provider,
          args: JSON.stringify(callInfo.args),
          to: callInfo.contract,
          value: options?.value,
          data,
        }
        console.error(logData)
        logger.instance.raw(logData)
      }
    } catch (e) {
      console.error("Error while sending logs", e, err)
    }
    throw err
  }
}
