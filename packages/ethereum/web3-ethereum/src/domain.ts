import type Web3 from "web3"
import type { Web3PromiEvent } from "web3-core"
import type { FormatType, TransactionReceipt, ETH_DATA_FORMAT } from "web3-types"
import { FMT_BYTES, FMT_NUMBER } from "web3-types"
import type { SendTransactionEvents } from "web3-eth"

export type Web3EthereumGasOptions = Partial<{
	gas: number
	gasPrice: string
}>

export type Web3EthereumConfig = Web3EthereumGasOptions & {
	web3: Web3
	from?: string
}

export type EthDataFormat = typeof ETH_DATA_FORMAT
export const NumberDataFormat = { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX } as const
export type TxReceiptNumberFormatted = FormatType<TransactionReceipt, typeof NumberDataFormat>
export type SendTxResult = Web3PromiEvent<TxReceiptNumberFormatted, SendTransactionEvents<typeof NumberDataFormat>>
