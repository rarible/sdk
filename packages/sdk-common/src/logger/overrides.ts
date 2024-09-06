import { BlockchainGroup } from "@rarible/api-client"

export const INVALID_TX_PARAMS_EIP_1559_ERROR =
  "Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559"

const EVM_WARN_MESSAGES = [
  INVALID_TX_PARAMS_EIP_1559_ERROR,
  "underlying network changed",
  "Balance not enough to cover gas fee. Please deposit at least",
  "Biaya gas telah diperbarui dan Anda memerlukan",
  "err: max fee per gas less than block base fee",
  "Error while gas estimation with message cannot estimate gas",
  "transaction may fail may require manual",
  "gas limit",
  "gas required exceeds allowance",
  "Insufficient fee balance",
  "Insufficient ETH to pay the network fees",
  "insufficient funds for gas * price + value",
  "max priority fee per gas higher than max fee per gas",
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
  "No keyring found for the requested account. Error info: There are keyrings, but none match the address",
  "Link Window Closed",
  "nonce too low",
  "transaction would cause overdraft",
].map(msg => msg.toLowerCase())

export const CANCEL_MESSAGES = [
  "Transaction canceled",
  "Request canceled by user",
  "User canceled",
  "Request cancelled by user",
  "Cancelled by User",
  "Request has been cancelled by the user",
  "transaction was cancelled",
  "transaction was canceled",
  "Sign transaction cancelled",
  "Firma de transacción cancelada",
  "Sign transaction cancelled",
  "Signing transaction was cancelled",
  "Transação de assinatura cancelada",
  "You canceled",
  "User cancelled login",
  "User cancelled the request",
  "user reject this request",
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
  "user rejected the request",
  "PocketUniverse Tx Signature: The user rejected the transaction signature.",
  "iFrame link is closed",
  "Link iFrame Closed",
  "rejected request from DeFi Wallet",
  "User rejected methods",
  "Транзакция отменена",
  "Failed to sign transaction",
  "Permission not given for signing message",
  "User denied message signature",
  "User denied transaction signature",
  "Подписание транзакции отменено",
  "การลงนามธุรกรรมถูกยกเลิก",
  "ยกเลิกแล้ว",
  "用户取消了操作",
  "签署交易已取消",
  "membatalkan",
  "La transaction de signature a été annulée",
  "User denied account authorization",
  "Firma transazione annullata",
  "İşlem imzalama iptal edildi",
  "Nutzer hat die Transaktion abgelehnt",
  "Signature de transaction annulée",
  "Signiervorgang abgebrochen",
  "Reject by the user",
  "User closed modal",
  "Permission denied",
  "The requested account and/or method has not been authorized by the user",
  "user did not approve",
  "Der Nutzer hat die Anfrage abgelehnt",
  "The user rejected the request",
  "El usuario rechazó la solicitud",
  "L'utilisateur a rejeté la demande",
  "O usuário rejeitou a solicitação",
  "The user rejected the request through Exodus",
  "Permission denied, denied",
  "user closed popup",
  "User has rejected the request",
  "The user rejected the request",
].map(msg => msg.toLowerCase())

export const COMMON_INFO_MESSAGES = [
  "The gas fee has been updated and you need",
  "The action was aborted by the user",
  "User denied requested chains",
  "Popup closed",
  "Please verify email address",
  "User denied account access",
  "Connection request reset. Please try again",
  "The tab is not active",
  "An internal error has occurred",
  "Произошла внутренняя ошибка.",
  "内部エラーが発生しました",
  "Une erreur interne s'est produite",
  "Tab inaktiv",
  "An internal error has occurred",
  "Ett internt fel har inträffat",
  "L'onglet n'est pas actif",
  "Het tabblad is niet actief",
  "Ha ocurrido un error interno",
  "A apărut o eroare internă",
  "Ha ocurrido un error interno",
  "La pestaña no está activa",
  "Si è verificato un errore interno",
  "Vyskytla sa interná chyba",
  "Вкладка не активна",
  "خطایی داخلی رخ داده است",
  "内部エラーが発生しました",
  "A guia não está ativa",
  "Dahili bir hata oluştu",
  "Er is een interne fout opgetreden",
  "Sekme etkin değil",
  "زبانه فعال نیست",
  "发生了一个内部的错误",
  "發生內部錯誤",
].map(msg => msg.toLowerCase())

export const OUT_OF_GAS_ERROR = "returned values aren't valid, did it run out of gas"
const shortCancelMessages = ["cancel", "canceled", "cancelled", "rejected"]

export function isCancelCode(code?: unknown) {
  return code === 4001 || code === 4100 || code === "ACTION_REJECTED"
}
export function isCancelMessage(msg: unknown, isLowerCase: boolean = false) {
  if (!msg || typeof msg !== "string") {
    return false
  }
  let msgLowerCase: string = isLowerCase ? msg : msg.toLowerCase()
  if (shortCancelMessages.includes(msgLowerCase)) {
    return true
  }
  return CANCEL_MESSAGES.some(msg => msgLowerCase?.includes(msg))
}

export function isInfoLevel(error: any): boolean {
  if (!error?.message || typeof error?.message !== "string") {
    return false
  }
  const msgLowerCase = error?.message.toLowerCase()
  if (isCancelCode(error?.error?.code) || isCancelMessage(msgLowerCase, true)) {
    return true
  }
  return COMMON_INFO_MESSAGES.some(msg => msgLowerCase?.includes(msg))
}

export function isEVMWarning(error: any): boolean {
  if (error?.name && ["WrongNetworkWarning", "InsufficientFundsError"].includes(error?.name)) return true
  const msgLowerCase = error?.message.toLowerCase()
  return EVM_WARN_MESSAGES.some(msg => msgLowerCase?.includes(msg))
}

export function isTezosWarning(err: any): boolean {
  const isWrappedError = err.name === "TezosProviderError"
  const originalError = isWrappedError ? err.error : err
  return (
    (originalError?.name === "UnknownBeaconError" && originalError?.title === "Aborted") ||
    originalError?.name === "NotGrantedTempleWalletError" ||
    originalError?.name === "NoAddressBeaconError" ||
    originalError?.name === "NoPrivateKeyBeaconError" ||
    originalError?.name === "BroadcastBeaconError" ||
    originalError?.name === "MissedBlockDuringConfirmationError" ||
    originalError?.message === "Error: timeout of 30000ms exceeded" ||
    err?.message?.endsWith("does not have enough funds for transaction")
  )
}

export function isSolanaWarning(error: any): boolean {
  return error?.name === "User rejected the request." || error?.error?.code === 4001
}

export const FLOW_WARN_MESSAGES = ["[Error Code: 1007] invalid proposal key", "User rejected signature"]

export function isFlowWarning(error: any): boolean {
  return FLOW_WARN_MESSAGES.some(msg => error?.message?.includes(msg))
}

export function getBlockchainByConnectorId(providerId: string): BlockchainGroup | undefined {
  switch (providerId) {
    case "beacon":
      return BlockchainGroup.TEZOS
    case "fcl":
    case "mattel":
      return BlockchainGroup.FLOW
    case "phantom":
    case "solflare":
      return BlockchainGroup.SOLANA
    case "injected":
    case "fortmatic":
    case "iframe":
    case "immutablex":
    case "mew":
    case "portis":
    case "torus":
    case "firebase":
    case "firebase-apple":
    case "firebase-email":
    case "walletconnect":
    case "walletlink":
      return BlockchainGroup.ETHEREUM
    default:
      return undefined
  }
}
