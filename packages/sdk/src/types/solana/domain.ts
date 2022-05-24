import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"
import type { BigNumberValue } from "@rarible/utils"
import type { UnionAddress } from "@rarible/types"
import type { RequestCurrency } from "../../common/domain"

export type SolanaGetEscrowBalanceRequest = {
	currency: RequestCurrency
	address: UnionAddress
}

export type SolanaDepositEscrowRequest = {
	currency: RequestCurrency
	amount: number
}

export type SolanaWithdrawEscrowRequest = {
	currency: RequestCurrency
	amount: number
}

export type SolanaGetEscrowBalance = (request: SolanaGetEscrowBalanceRequest) => Promise<BigNumberValue>
export type SolanaDepositEscrow = Action<"send-tx", SolanaDepositEscrowRequest, IBlockchainTransaction>
export type SolanaWithdrawEscrow = Action<"send-tx", SolanaWithdrawEscrowRequest, IBlockchainTransaction>
