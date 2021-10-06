import type { BigNumber } from "@rarible/types/build/big-number"
import type { ItemId, EthErc20AssetType, EthEthereumAssetType, FlowAssetType } from "@rarible/api-client"
import type { IAction } from "@rarible/action/build"
import type { PaymentAssetType } from "../../common/domain"

export type PrepareSellRequest = {
	/**
	 * Item to sell
	 */
	itemId: ItemId
}

export type PrepareSellResponse = {
	/**
	 * assets that can be taken
	 */
	availableTakeAssets: PaymentAssetType[]
	/**
	 * Max amount to sell (how many user owns and can sell). If 1, then input not needed
	 */
	maxAmount: BigNumber
	/**
	 * protocol base fee in basis points
	 */
	baseFee: number
}

export enum SellActionEnum {
	ETHEREUM_APPROVE = "approve",
	ETHEREUM_SIGN_ORDER = "sign-order",
	FLOW_SEND_TRANSACTION = "send-transaction"
}

export type SellRequest = {
	/**
	 * Item to sell
	 */
	itemId: ItemId
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

export interface ISellSdk {
	prepare: (request: PrepareSellRequest) => Promise<PrepareSellResponse>
	submit: IAction<SellRequest, SellActionEnum, void>
}
