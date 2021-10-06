import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { ItemId, EthErc20AssetType, EthEthereumAssetType, FlowAssetType } from "@rarible/api-client"
import type { ActionBuilder } from "@rarible/action/build"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/build/domain"
import type { PaymentAssetType } from "../../common/domain"

export type PrepareSellRequest = {
	itemId: ItemId
}

export type PrepareSellResponse = {
	/**
	 * assets that can be taken
	 */
	availableTakeAssets: PaymentAssetType[]
	maxAmount: BigNumber
	/**
	 * protocol base fee in basis points. If undefined - it doesn't supported by contract
	 */
	baseFee: BigNumber | undefined
}

export type PrepareSellFunction = (config: PrepareSellRequest) => Promise<PrepareSellResponse>

export enum SellActionEnum {
	ETHEREUM_APPROVE = "approve",
	ETHEREUM_SIGN_ORDER = "sign-order",
	FLOW_SEND_TRANSACTION = "send-transaction"
}

export type SellConfig = {
	/**
	 * How much editions to sell
	 */
	value: BigNumber
	/**
	 * Price per edition
	 */
	price: BigNumber
	currency: EthErc20AssetType | EthEthereumAssetType | FlowAssetType
}

type SellAction = ActionBuilder<SellActionEnum, void, [...unknown[], IBlockchainTransaction]>
export type SellFunction = (data: SellConfig) => Promise<SellAction>

export interface ISellSdk {
	(wallet: BlockchainWallet): ISellSdk
	prepare: PrepareSellFunction
	submit: SellFunction
}
