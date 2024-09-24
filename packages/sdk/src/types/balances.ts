import type { UnionAddress } from "@rarible/types"
import type { Order, OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client"
import type { FlowAssetTypeFt } from "@rarible/api-client/build/models/AssetType"
import type { SupportedBlockchain } from "@rarible/sdk-common/build/utils/blockchain"
import type { EthErc20AssetType, EthEthereumAssetType } from "@rarible/api-client/build/models/AssetType"
import type * as ApiClient from "@rarible/api-client"
import type { RequestCurrency } from "../common/domain"

/**
 * Fetch balance of fungible or non-fungible tokens
 * @param address the address for which you need to receive the balance
 * @param currency token, the balance of which needs to be received
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
 * @param blockchain Blockchain where performs operation
 * @param isWrap Is wrap or unwrap operation
 * @param value amount of funds to convert
 * @returns {@link IBlockchainTransaction}
 */
export type IConvert = (request: ConvertRequest) => Promise<IBlockchainTransaction>

export type ConvertRequest = {
  blockchain: SupportedBlockchain
  isWrap: boolean
  value: BigNumberValue
}

export type IBalanceTransfer = (request: IBalanceTransferRequest) => Promise<IBlockchainTransaction>

export type IBalanceTransferRequest = {
  recipient: UnionAddress
  currency: IBalanceTransferCurrency
  amount: BigNumberValue
}
export type IBalanceTransferCurrency = ApiClient.CurrencyId | EthEthereumAssetType | EthErc20AssetType | FlowAssetTypeFt

export type CurrencyOrOrder =
  | {
      currency: RequestCurrency
    }
  | {
      order: Order
    }
  | {
      orderId: OrderId
    }
  | {
      blockchain: SupportedBlockchain
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

export type BuyAmmInfoRequest = {
  hash: string
  numNFTs: number
}
export type IGetBuyAmmInfo = (request: BuyAmmInfoRequest) => Promise<AmmTradeInfo>
