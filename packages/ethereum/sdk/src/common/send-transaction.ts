import type { ContractSendMethod, SendOptions } from "web3-eth-contract"
import type { PromiEvent, TransactionReceipt } from "web3-core"
import { toAddress, toBinary, toWord } from "@rarible/types"
import type { GatewayControllerApi } from "@rarible/ethereum-api-client"
import type { EthereumFunctionCall, EthereumSendOptions, EthereumTransaction } from "@rarible/ethereum-provider"
import { LogsLevel } from "../types"
import type { ILoggerConfig } from "./logger/logger"
import { getErrorMessageString } from "./logger/logger"
import { estimateGas } from "./estimate-gas"

export type SendFunction = (
	functionCall: EthereumFunctionCall, options?: EthereumSendOptions,
) => Promise<EthereumTransaction>

type SendMethod = (
	api: GatewayControllerApi,
	checkChainId: () => Promise<boolean>,
	functionCall: EthereumFunctionCall,
	options?: EthereumSendOptions
) => Promise<EthereumTransaction>

export function getSendWithInjects(injects: {
	logger?: ILoggerConfig
} = {}): SendMethod {
	const logger = injects.logger

	return async function send(
		api: GatewayControllerApi,
		checkChainId: () => Promise<boolean>,
		functionCall: EthereumFunctionCall,
		options?: EthereumSendOptions
	): Promise<EthereumTransaction> {
		await checkChainId()
		const callInfo = await functionCall.getCallInfo()

		try {
			await estimateGas(functionCall, { from: callInfo.from, value: options?.value }, logger)
		} catch (e) {
			console.error("EstimateGas failed with error", e)
		}

		try {
			const tx = await functionCall.send(options)
			try {
			  await createPendingLogs(api, tx)
			} catch (e) {
				console.error("createPendingLogs error", e)
			}
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
	checkChainId: () => Promise<boolean>,
	functionCall: EthereumFunctionCall,
	options?: EthereumSendOptions,
) => Promise<EthereumTransaction>

export function getSimpleSendWithInjects(injects: {
	logger?: ILoggerConfig
} = {}): SimpleSendMethod {
	const logger = injects.logger

	return async function simpleSend(
		checkChainId: () => Promise<boolean>,
		functionCall: EthereumFunctionCall,
		options?: EthereumSendOptions,
	) {
		const callInfo = await functionCall.getCallInfo()

		try {
			await estimateGas(functionCall, { from: callInfo.from, value: options?.value }, logger)
		} catch (e) {
			console.error("EstimateGas failed with error", e)
		}

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

export async function createPendingLogs(api: GatewayControllerApi, tx: EthereumTransaction) {
	const createTransactionRequest = {
		hash: toWord(tx.hash),
		from: toAddress(tx.from),
		to: tx.to ? toAddress(tx.to) : undefined,
		input: toBinary(tx.data),
		nonce: tx.nonce,
	}
	return await api.createGatewayPendingTransactions({ createTransactionRequest })
}

function getTxData(tx: EthereumTransaction) {
	return {
		hash: tx.hash,
		data: tx.data,
		nonce: tx.nonce,
		from: tx.from,
		to: tx.to,
	}
}

export async function sentTx(source: ContractSendMethod, options: SendOptions): Promise<string> {
	const event = source.send({ ...options, gas: 3000000 })
	return waitForHash(event)
}

export async function sentTxConfirm(source: ContractSendMethod, options: SendOptions): Promise<string> {
	const event = source.send({ ...options, gas: 3000000 })
	return waitForConfirmation(event)
}

export async function waitForHash<T>(promiEvent: PromiEvent<T>): Promise<string> {
	return new Promise((resolve, reject) => {
		promiEvent.once("transactionHash", hash => resolve(hash))
		promiEvent.once("error", error => reject(error))
	})
}

export async function waitForConfirmation<T>(promiEvent: PromiEvent<T>): Promise<string> {
	return new Promise((resolve, reject) => {
		promiEvent.once("confirmation", (confNumber: number, receipt: TransactionReceipt) => resolve(receipt.transactionHash))
		promiEvent.once("error", error => reject(error))
	})
}
export async function waitForReceipt<T>(promiEvent: PromiEvent<T>): Promise<TransactionReceipt> {
	return new Promise((resolve, reject) => {
		promiEvent.once("receipt", receipt => resolve(receipt))
		promiEvent.once("error", error => reject(error))
	})
}
