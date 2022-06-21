import type { UnionAddress } from "@rarible/types"
import type { Blockchain, Order, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { RequestCurrency } from "../common/domain"

/**
 * Fetch balance of fungible or non-fungible tokens
 * @param {UnionAddress} address the address for which you need to receive the balance
 * @param {RequestCurrency} currency token, the balance of which needs to be received
 * @example
 * {
 *   address: "ETHEREUM:0x....",
 *   currency: {
 *			"@type": "ETH";
 *			blockchain?: Blockchain;
 * }
 *
 * {
 *   address: "ETHEREUM:0x....",
 *   currency: {
 *			"@type": "ERC20",
 *			contract: ContractAddress,
 * }
 *
 * @returns {Promise<BigNumberValue>}
 */
export type IGetBalance = (address: UnionAddress, currency: RequestCurrency) => Promise<BigNumberValue>

/**
 * Convert funds to wrapped token or unwrap existed tokens (ex. ETH->wETH, wETH->ETH)
 * @param {Blockchain} blockchain Blockchain where performs operation
 * @param {boolean} isWrap Is wrap or unwrap operation
 * @param {BigNumberValue} value amount of funds to convert
 * @returns {Promise<IBlockchainTransaction>}
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
