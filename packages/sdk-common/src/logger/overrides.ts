import { BlockchainGroup } from "@rarible/api-client"

const EVM_WARN_MESSAGES = [
	"User denied transaction signature",
	"User denied message signature",
	"Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559",
	"Firma transazione annullata",
	"İşlem imzalama iptal edildi",
	"Nutzer hat die Transaktion abgelehnt",
	"Signature de transaction annulée",
	"Signiervorgang abgebrochen",
	"User denied message signature",
	"User denied transaction signature",
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
	"insufficient funds for intrinsic transaction cost",
	"intrinsic gas too low",
	"max fee per gas less than block base fee",
	"maxFeePerGas cannot be less than maxPriorityFeePerGas",
	"Please deposit at least",
	"replacement transaction underpriced",
	"Returned error: insufficient funds for gas * price + value",
	"Returned error: transaction underpriced",
	"Saldo tidak cukup untuk menutup biaya gas. Harap setor setidaknya",
	"The gas price is low, please increase the gas price try again",
	"transaction underpriced",
	"Комиссия за газ обновлена, и вам необходимо",
	"Insufficient ETH funds",
	"Please enable Blind signing or Contract data in the Ethereum app Settings",
	"Failed to sign transaction",
	"Permission not given for signing message",
	"Транзакция отменена",
	"No keyring found for the requested account. Error info: There are keyrings, but none match the address",
	"Link Window Closed",
	"Popup closed",
	"User denied account authorization",
	"membatalkan",
	"La transaction de signature a été annulée",
].map(msg => msg.toLowerCase())

export const COMMON_INFO_MESSAGES = [
	"cancel",
	"canceled",
	"cancelled",
	"Transaction canceled",
	"Request canceled by user",
	"User canceled",
	"Request cancelled by user",
	"Cancelled by User",
	"Request has been cancelled by the user",
	"transaction was canceled",
	"Sign transaction cancelled",
	"Firma de transacción cancelada",
	"Sign transaction cancelled",
	"Signing transaction was cancelled",
	"Transação de assinatura cancelada",
	"You canceled",
	"User cancelled login",
	"MetaMask Tx Signature: User refused to sign the transaction.",
	"Request rejected",
	"User rejected the transaction",
	"Please enable Blind Signature or Contract Data in Ethereum Application Settings.",
	"User denied to sign transaction",
	"User declined the request.",
	"PocketUniverse Tx Signature: User declined to sign the transaction.",
	"Transaction declined",
	"User declined transaction",
	"MetaMask Tx Signature: Transaction signature denied by user.",
	"Transaction rejected",
	"User refused to sign the transaction",
	"Please enable Blind Signing or Contract Data in Ethereum Application Settings",
	"The user rejected the request.",
	"PocketUniverse Tx Signature: The user rejected the transaction signature.",
	"Rejected",
	"User rejected the request",
	"iFrame link is closed",
	"Link iFrame Closed",
	"The gas fee has been updated and you need",
	"rejected request from DeFi Wallet",
	"User rejected methods",
].map(msg => msg.toLowerCase())

export function isInfoLevel(error: any): boolean {
	if (error?.error?.code === 4001
    || error?.error?.code === 4100
    || error?.error?.code === "ACTION_REJECTED") {
		return true
	}
	if (typeof error?.message !== "string" || !error?.message) {
		return false
	}
	const msgLowerCase = error?.message.toLowerCase()
	return COMMON_INFO_MESSAGES.some(msg => msgLowerCase?.includes(msg))
}

export function isEVMWarning(error: any): boolean {
	const msgLowerCase = error?.message.toLowerCase()
	return EVM_WARN_MESSAGES.some(msg => msgLowerCase?.includes(msg))
}

export function isTezosWarning(err: any): boolean {
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

export function isSolanaWarning(error: any): boolean {
	return error?.name === "User rejected the request." || error?.error?.code === 4001
}

export const FLOW_WARN_MESSAGES = [
	"[Error Code: 1007] invalid proposal key",
	"User rejected signature",
]

export function isFlowWarning(error: any): boolean {
	return FLOW_WARN_MESSAGES.some(msg => error?.message?.includes(msg))
}

export function getBlockchainByConnectorId(providerId: string): BlockchainGroup | undefined {
	switch (providerId) {
		case "beacon": return BlockchainGroup.TEZOS
		case "fcl":
		case "mattel": return BlockchainGroup.FLOW
		case "phantom":
		case "solflare": return BlockchainGroup.SOLANA
		case "injected":
		case "fortmatic":
		case "iframe":
		case "immutablex":
		case "mew":
		case "portis":
		case "torus":
		case "walletconnect":
		case "walletlink": return BlockchainGroup.ETHEREUM
		default: return undefined
	}
}
