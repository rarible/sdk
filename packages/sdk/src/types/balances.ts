import type { UnionAddress } from "@rarible/types"
import type { Blockchain, Order, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { RequestCurrency } from "../common/domain"

export type IGetBalance = (address: UnionAddress, currency: RequestCurrency) => Promise<BigNumberValue>

/**
 * Convert funds to wrapped token or unwrap existed tokens (ex. ETH->wETH, wETH->ETH)
 * @param blockchain Blockchain where performs operation
 * @param isWrap Is wrap or unwrap operation
 * @param value amount of funds to convert
 */
export type IConvert = (request: ConvertRequest) => Promise<IBlockchainTransaction>

export type ConvertRequest = {
	blockchain: Blockchain
	isWrap: boolean
	value: BigNumberValue
}


export type CurrencyOrOrder = {
	currency: RequestCurrency
} | {
	order: Order
} | {
	orderId: OrderId
} | {
	blockchain: Blockchain
}

export type GetBiddingBalanceRequest = {
	walletAddress: UnionAddress
} & CurrencyOrOrder

export type IGetBiddingBalance = (request: GetBiddingBalanceRequest) => Promise<BigNumberValue>

export type DepositBiddingBalanceRequest = {
	amount: BigNumberValue
} & CurrencyOrOrder

export type IDepositBiddingBalance = Action<"send-tx", DepositBiddingBalanceRequest, IBlockchainTransaction>

export type WithdrawBiddingBalanceRequest = {
	amount: BigNumberValue
} & CurrencyOrOrder

export type IWithdrawBiddingBalance = Action<"send-tx", WithdrawBiddingBalanceRequest, IBlockchainTransaction>
