import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { ActionBuilder } from "@rarible/action/build"
import type { Erc1155AssetType, Erc1155LazyAssetType, Erc20AssetType, Erc721AssetType, Erc721LazyAssetType, EthAssetType, FlowAssetType, GenerativeArtAssetType } from "@rarible/protocol-api-client"
import type { BlockchainAddress } from "@rarible/sdk-types/build"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/build/domain"

type SellDataRequest = {
	contract: BlockchainAddress
	tokenId: string
	value: BigNumber
}

type SellData = {
	availableTakeAssets: (Erc20AssetType | EthAssetType)[] | FlowAssetType[] // assets that can be taken
	make: Erc721AssetType | Erc1155AssetType | Erc721LazyAssetType | Erc1155LazyAssetType | GenerativeArtAssetType
	freeSupply: BigNumber // maximum quantity of tokens to sell
	baseFee: BigNumber // protocol base fee in basis points
}

type PrepareSellFunction = (config: SellDataRequest) => Promise<SellData>

enum SellActionEnum {
	ETHEREUM_APPROVE = "approve",
	ETHEREUM_SIGN_ORDER = "sign-order",
	FLOW_SEND_TRANSACTION = "send-transaction"
}

type SellAction = ActionBuilder<SellActionEnum, void, [...unknown[], IBlockchainTransaction]>
export type SellFunction = (data: SellDataRequest) => Promise<SellAction>

export interface ISellSdk {
	(wallet: BlockchainWallet): ISellSdk
	prepare: PrepareSellFunction
	sell: SellFunction
}
