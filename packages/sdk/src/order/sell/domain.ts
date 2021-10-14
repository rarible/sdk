import type { BigNumber } from "@rarible/types/build/big-number"
import type { EthErc20AssetType, EthEthereumAssetType, FlowAssetTypeNft, FlowAssetTypeFt, ItemId, OrderId } from "@rarible/api-client"
import { OrderPayout } from "@rarible/api-client"
import { TezosFA12AssetType, TezosXTZAssetType } from "@rarible/api-client/build/models/AssetType"
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

export type SellRequestCurrency =
	EthErc20AssetType | EthEthereumAssetType |
	FlowAssetTypeNft | FlowAssetTypeFt |
	TezosXTZAssetType | TezosFA12AssetType

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
	currency: SellRequestCurrency
	/**
	 * Origin fees, if not supported by the underlying contract, will throw Error
	 */
	originFees?: OrderPayout[]
	/**
	 * Payouts, if not supported by the underlying contract, will throw Error
	 */
	payouts?: OrderPayout[]
}


export interface PrepareSellResponse extends AbstractPrepareResponse<"approve" | "sign", SellRequest, OrderId> {
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

export type ISell = (request: PrepareSellRequest) => Promise<PrepareSellResponse>
