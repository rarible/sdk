import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types"
import type { FlowWallet } from "@rarible/sdk-wallet"
import type { FlowEnv, FlowNetwork } from "@rarible/flow-sdk"
import { Warning } from "@rarible/logger/build"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import type { IBalanceTransferRequest } from "../../types/balances"
import { retry } from "../../common/retry"
import { parseFlowAddressFromUnionAddress } from "./common/converters"
import { getFlowCurrencyFromAssetType } from "./common/get-flow-currency-from-asset-type"
import { getSimpleFlowFungibleBalance } from "./balance-simple"

export class FlowBalance {
  constructor(
    private sdk: FlowSdk,
    private env: FlowEnv,
    private network: FlowNetwork,
    private wallet: Maybe<FlowWallet>,
  ) {
    this.getBalance = this.getBalance.bind(this)
    this.transfer = this.transfer.bind(this)
  }

  async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
    const assetType = getCurrencyAssetType(currency)
    if (this.wallet) {
      const flowAddress = parseFlowAddressFromUnionAddress(address)
      const flowAsset = getFlowCurrencyFromAssetType(assetType)

      const balance = await retry(10, 1000, async () => {
        return await this.sdk.wallet.getFungibleBalance(flowAddress, flowAsset)
      })
      return toBn(balance)
    }
    return await retry(10, 1000, async () => {
      return await getSimpleFlowFungibleBalance(this.env, address, assetType)
    })
  }

  async transfer(request: IBalanceTransferRequest) {
    if (!this.wallet) {
      throw new Warning("Wallet is undefined")
    }
    const assetType = getCurrencyAssetType(request.currency)
    const flowAddress = parseFlowAddressFromUnionAddress(request.recipient)
    const flowAsset = getFlowCurrencyFromAssetType(assetType)

    const tx = await this.sdk.wallet.transferFunds({
      recipient: flowAddress,
      currency: flowAsset,
      amount: request.amount,
    })
    return new BlockchainFlowTransaction(tx, this.network)
  }
}
