import { NetworkError, Warning } from "@rarible/logger/build"
import { LogLevel } from "@rarible/logger/build/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import { NetworkErrorCode } from "../apis"

const COMMON_NETWORK_ERROR_MESSAGES = [
	"Network request failed",
	"Failed to fetch",
]

const EVM_WARN_MESSAGES = [
	"User denied transaction signature",
	"User denied message signature",
	"User rejected the transaction",
	"Sign transaction cancelled",
	"Link iFrame Closed",
	"Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559",
	"cancel",
	"Canceled",
	"cancelled",
	"Firma de transacción cancelada",
	"Firma transazione annullata",
	"İşlem imzalama iptal edildi",
	"Nutzer hat die Transaktion abgelehnt",
	"Rejected",
	"Sign transaction cancelled",
	"Signature de transaction annulée",
	"Signiervorgang abgebrochen",
	"Signing transaction was cancelled",
	"Transação de assinatura cancelada",
	"Transaction rejected",
	"User Canceled",
	"User canceled",
	"User declined transaction",
	"User denied message signature",
	"User denied transaction signature",
	"User rejected the transaction",
	"You canceled.",
	"Подписание транзакции отменено",
	"การลงนามธุรกรรมถูกยกเลิก",
	"ยกเลิกแล้ว",
	"用户取消了操作",
	"签署交易已取消",
	"underlying network changed",
	"Balance not enough to cover gas fee. Please deposit at least",
	"Biaya gas telah diperbarui dan Anda memerlukan",
	"err: max fee per gas less than block base fee",
	"Error while gas estimation with message cannot estimate gas",
	"transaction may fail may require manual",
	"gas limit",
	"gas required exceeds allowance",
	"Insufficient fee balance",
	"insufficient funds for gas * price + value",
	"intrinsic gas too low",
	"max fee per gas less than block base fee",
	"maxFeePerGas cannot be less than maxPriorityFeePerGas",
	"Please deposit at least",
	"replacement transaction underpriced",
	"Returned error: insufficient funds for gas * price + value",
	"Returned error: transaction underpriced",
	"Saldo tidak cukup untuk menutup biaya gas. Harap setor setidaknya",
	"The gas fee has been updated and you need",
	"The gas price is low, please increase the gas price try again",
	"transaction underpriced",
	"Комиссия за газ обновлена, и вам необходимо",
	"Insufficient ETH funds",
	"Please enable Blind signing or Contract data in the Ethereum app Settings",
	"Failed to sign transaction",
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
			if (
				err.error?.code === 4001 ||
				EVM_WARN_MESSAGES.some(msg => err?.message?.includes(msg))
			) {
				return true
			}
		}

		if (blockchain === WalletType.TEZOS) {
			return isTezosWarning(err)
		}

		if (blockchain === WalletType.SOLANA) {
			if (err?.name === "User rejected the request.") {
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

function isTezosWarning(err: any): boolean {
	const isWrappedError = err.name === "TezosProviderError"
	const originalError = isWrappedError ? err.error : err
	return (originalError?.name === "UnknownBeaconError" && originalError?.title === "Aborted")
    || originalError?.name === "NotGrantedTempleWalletError"
    || originalError?.name === "NoAddressBeaconError"
    || originalError?.name === "NoPrivateKeyBeaconError"
    || originalError?.name === "BroadcastBeaconError"
    || originalError?.name === "MissedBlockDuringConfirmationError"
    || originalError?.message === "Error: timeout of 30000ms exceeded"
    || err?.message?.endsWith("does not have enough funds for transaction")
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

const execRevertedRegexp = /execution reverted:(.*[^\\])/
const ethersSig = "Error while gas estimation with message cannot estimate gas"
const ethersRevertedRegexp = /"execution reverted[:]?(.*?)"/

function isContractError(error: any): boolean {
	return error?.message?.includes("execution reverted")
}

export function getExecRevertedMessage(msg: string) {
	if (!msg) return msg
	try {
		const result = msg.includes(ethersSig) ? msg.match(ethersRevertedRegexp): msg.match(execRevertedRegexp)
		if (result && result[1]) {
			return result[1].trim()
		}
	} catch (e) {}

	return msg
}
