import type { BigNumber } from "@rarible/types/build/big-number"
import type { EthErc20AssetType, EthEthereumAssetType, FlowAssetType, ItemId } from "@rarible/api-client"
import type { CurrencyType } from "../../common/domain"
import { AbstractPrepareResponse } from "../../common/domain"

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


export interface PrepareSellResponse extends AbstractPrepareResponse<"approve" | "sign" | "send-transaction", SellRequest, void> {
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
}

export interface ISell {
	prepare: (request: PrepareSellRequest) => Promise<PrepareSellResponse>
}
