import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { IStartAuctionRequest } from "../../../types/auction/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"
import * as common from "../common"
import { Action } from "@rarible/action";
import { convertToEthereumAssetType, isEVMBlockchain } from "../common";
import { PrepareOrderRequest } from "../../../types/order/common";

export class StartAuction {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
	}

	async start(prepareRequest: PrepareOrderRequest): Promise<IBlockchainTransaction> {
    if (!prepareRequest.itemId) {
      throw new Error("ItemId has not been specified")
    }

    const [domain, contract, tokenId] = prepareRequest.itemId.split(":")
    if (!isEVMBlockchain(domain)) {
      throw new Error(`Not an ethereum item: ${prepareRequest.itemId}`)
    }

    const item = await this.sdk.apis.nftItem.getNftItemById({
      itemId: `${contract}:${tokenId}`,
    })
    const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
      collection: contract,
    })

    const submit = this.sdk.auction.start
      .before((request: IStartAuctionRequest) => {
        return {
          makeAssetType: convertToEthereumAssetType({

          }),
          amount: BigNumber,
          takeAssetType: EthAssetType | Erc20AssetType,
          minimalStepDecimal: BigNumberValue,
          minimalPriceDecimal: BigNumberValue,
          duration: number,
          startTime?: number,
          buyOutPriceDecimal: BigNumberValue,
          payouts: Part[],
          originFees: Part[],
        }
      })

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
      multiple: ,
      baseFee: await this.sdk.order.getBaseOrderFee(),
      submit,
		}
	}
}
