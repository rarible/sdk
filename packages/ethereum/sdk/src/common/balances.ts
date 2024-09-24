import type { Address, BigNumber as AssetTypeBigNumber } from "@rarible/types"
import type { Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { toBigNumber } from "@rarible/types"
import { createErc20Contract } from "../order/contracts/erc20"
import type { RaribleEthereumApis } from "./apis"
import { wrapInRetry } from "./retry"
import type { SendFunction } from "./send-transaction"
import { getRequiredWallet } from "./get-required-wallet"
import { ETHER_IN_WEI } from "./index"

export type BalanceRequestAssetType = EthAssetType | Erc20AssetType

// export type TransferAssetType = Erc20AssetType | EthAssetType
export type TransferBalanceAsset = {
  assetType: EthAssetType | Erc20AssetType
} & (
  | {
      value?: AssetTypeBigNumber
    }
  | {
      valueDecimal?: AssetTypeBigNumber
    }
)

export class Balances {
  constructor(
    private readonly ethereum: Maybe<Ethereum>,
    private readonly send: SendFunction,
    private readonly getApis: () => Promise<RaribleEthereumApis>,
  ) {
    this.getBalance = this.getBalance.bind(this)
    this.transfer = this.transfer.bind(this)
  }

  async getBalance(address: Address, assetType: BalanceRequestAssetType): Promise<BigNumber> {
    const apis = await this.getApis()
    switch (assetType.assetClass) {
      case "ETH": {
        const ethBalance = await wrapInRetry(() => apis.balances.getEthBalance({ owner: address }))
        return toBn(ethBalance.decimalBalance)
      }
      case "ERC20": {
        const balance = await wrapInRetry(() =>
          apis.balances.getErc20Balance({
            contract: assetType.contract,
            owner: address,
          }),
        )
        return toBn(balance.decimalBalance)
      }
      default:
        throw new Error("Asset class is not supported")
    }
  }

  async getNormalizedTransferValue(asset: TransferBalanceAsset): Promise<AssetTypeBigNumber> {
    if ("value" in asset && asset.value) return asset.value
    if ("valueDecimal" in asset && asset.valueDecimal) {
      if (asset.assetType.assetClass === "ETH") {
        return toBigNumber(toBn(asset.valueDecimal).multipliedBy(ETHER_IN_WEI).toFixed())
      }
      if (asset.assetType.assetClass === "ERC20") {
        const decimals = await createErc20Contract(getRequiredWallet(this.ethereum), asset.assetType.contract)
          .functionCall("decimals")
          .call()
        return toBigNumber(
          toBn(asset.valueDecimal)
            .multipliedBy(toBn(10).pow(Number(decimals)))
            .toFixed(),
        )
      }
    }
    throw new Error("TransferAsset must includes value")
  }

  async transfer(address: Address, asset: TransferBalanceAsset): Promise<EthereumTransaction> {
    const value = (await this.getNormalizedTransferValue(asset)).toString()
    switch (asset.assetType.assetClass) {
      case "ETH": {
        return getRequiredWallet(this.ethereum).sendTransaction({
          to: address,
          value,
        })
      }
      case "ERC20": {
        const fn = await createErc20Contract(getRequiredWallet(this.ethereum), asset.assetType.contract).functionCall(
          "transfer",
          address,
          value,
        )
        return this.send(fn)
      }
      default:
        throw new Error("Unrecognized asset type for transfer")
    }
  }
}
