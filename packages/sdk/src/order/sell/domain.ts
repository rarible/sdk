import type { BigNumber } from "@rarible/types/build/big-number"
import type { ItemId, EthErc20AssetType, EthEthereumAssetType, FlowAssetType, Blockchain } from "@rarible/api-client"
import type { ActionBuilder } from "@rarible/action"
import { Action } from "@rarible/action"
import type { CurrencyType } from "../../common/domain"

export type PrepareSellRequest = {
	/**
	 * Item identifier to sell
	 */
	itemId: ItemId
}

export enum SellActionEnum {
	ETHEREUM_APPROVE = "approve",
	ETHEREUM_SIGN_ORDER = "sign-order",
	FLOW_SEND_TRANSACTION = "send-transaction"
}

export type SellRequest = {
	/**
	 * How many editions to sell
	 */
	amount: BigNumber
	/**
	 * Price per edition
	 */
	price: BigNumber
	/**
	 * Currency of the trade
	 */
	currency: EthErc20AssetType | EthEthereumAssetType | FlowAssetType
}

export type PrepareSellResponse = {
	/**
	 * currencies supported by the blockchain
	 */
	supportedCurrencies: CurrencyType[]
	/**
	 * Max amount to sell (how many user owns and can sell). If 1, then input not needed
	 */
	maxAmount: BigNumber
	/**
	 * protocol base fee in basis points
	 */
	baseFee: number

	submit: Action<SellActionEnum, SellRequest, void>
}

type SellFunction = (request: PrepareSellRequest) => Promise<PrepareSellResponse>
