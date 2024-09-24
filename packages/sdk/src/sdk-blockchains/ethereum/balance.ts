import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import { Action } from "@rarible/action"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type * as ApiClient from "@rarible/api-client"
import { extractBlockchain, extractId } from "@rarible/sdk-common"
import type {
  EthErc20AssetType,
  EthEthereumAssetType,
  NativeCurrencyAssetType,
  TokenCurrencyAssetType,
} from "@rarible/api-client/build/models/AssetType"
import { toAddress } from "@rarible/types"
import type { TransferBalanceAsset } from "@rarible/protocol-ethereum-sdk/src/common/balances"
import type { ConvertRequest } from "../../types/balances"
import type {
  DepositBiddingBalanceRequest,
  GetBiddingBalanceRequest,
  WithdrawBiddingBalanceRequest,
} from "../../types/balances"
import { getCurrencyAssetType, getCurrencyId, isErc20, isEth } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import type { IApisSdk } from "../../domain"
import type { IBalanceTransferRequest } from "../../types/balances"
import {
  assertWallet,
  convertEthereumContractAddress,
  convertToEthereumAsset,
  getWalletNetwork,
  isEVMBlockchain,
} from "./common"

export class EthereumBalance {
  constructor(
    private sdk: RaribleSdk,
    private wallet: Maybe<EthereumWallet>,
    private readonly apis: IApisSdk,
  ) {
    this.getBalance = this.getBalance.bind(this)
    this.convert = this.convert.bind(this)
    this.getBiddingBalance = this.getBiddingBalance.bind(this)
    this.transfer = this.transfer.bind(this)
  }

  async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumber> {
    const type = getCurrencyAssetType(currency)
    if (!isEth(type) && !isErc20(type)) {
      throw new Error("Unsupported asset type for getting balance")
    }
    const response = await this.apis.balances.getBalance({
      currencyId: getCurrencyId(currency as ApiClient.EthErc20AssetType | ApiClient.EthEthereumAssetType),
      owner: address,
    })
    return toBn(response.decimal)
  }

  async convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
    const tx = await this.send(request)
    return new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
  }

  private send(request: ConvertRequest) {
    if (request.isWrap) return this.sdk.balances.deposit(request.value)
    return this.sdk.balances.withdraw(request.value)
  }

  async getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumber> {
    const currency = await this.getBiddingCurrency(request)
    return this.getBalance(request.walletAddress, currency)
  }

  private async getBiddingCurrency(request: GetBiddingBalanceRequest): Promise<RequestCurrency> {
    if ("currency" in request) {
      return request.currency
    } else {
      const wrappedContract = await this.sdk.balances.getWethContractAddress()
      const blockchain = extractBlockchain(request.walletAddress)
      if (isEVMBlockchain(blockchain)) {
        return {
          "@type": "ERC20",
          contract: convertEthereumContractAddress(wrappedContract, blockchain),
        }
      }
      throw new Error(`Bidding balance is not supported for ${blockchain}`)
    }
  }

  readonly depositBiddingBalance = Action.create({
    id: "send-tx" as const,
    run: (request: DepositBiddingBalanceRequest) =>
      this.convert({
        blockchain: Blockchain.ETHEREUM,
        isWrap: true,
        value: request.amount,
      }),
  })

  readonly withdrawBiddingBalance = Action.create({
    id: "send-tx" as const,
    run: (request: WithdrawBiddingBalanceRequest) =>
      this.convert({
        blockchain: Blockchain.ETHEREUM,
        isWrap: false,
        value: request.amount,
      }),
  })

  async transfer(request: IBalanceTransferRequest): Promise<IBlockchainTransaction> {
    const evmAddress = extractId(request.recipient)
    const assetType = getCurrencyAssetType(request.currency)

    const tx = await this.sdk.balances.transfer(
      toAddress(evmAddress),
      (await convertToEthereumAsset(assertWallet(this.wallet).ethereum, {
        type: assetType,
        value: request.amount,
      })) as TransferBalanceAsset,
    )
    return new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
  }
}

export type TransferCurrency =
  | NativeCurrencyAssetType
  | TokenCurrencyAssetType
  | EthEthereumAssetType
  | EthErc20AssetType
