import { NetworkError, Warning } from "@rarible/logger/build"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import { isEVMWarning, isSolanaWarning, isTezosWarning } from "@rarible/sdk-common"
import { NetworkErrorCode } from "../apis"

const COMMON_NETWORK_ERROR_MESSAGES = [
	"Network request failed",
	"Failed to fetch",
]

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
	CONTRACT_ERROR = "CONTRACT_ERROR"
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

	if (
		isErrorWarning(error, wallet?.walletType) ||
		error instanceof Warning ||
		error?.name === "Warning"
	) {
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

function isContractError(error: any): boolean {
	return error?.message?.includes("execution reverted")
}
