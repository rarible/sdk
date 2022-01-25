import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import type { IStartAuctionRequest } from "../../../types/auction/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"
import * as common from "../common"
import {
	convertToEthereumAssetType,
	getEthereumItemId,
	getEthTakeAssetType,
	isEVMBlockchain,
	toEthereumParts,
} from "../common"
import type { PrepareOrderInternalRequest } from "../../../types/order/common"
import { PrepareOrderRequest } from "../../../types/order/common"
import type { PrepareAuctionResponse } from "../../../types/auction/domain"

export class StartAuction {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
	}

	async start(prepareRequest: PrepareOrderInternalRequest): Promise<PrepareAuctionResponse> {
		const [domain, contract] = prepareRequest.collectionId.split(":")
		if (!isEVMBlockchain(domain)) {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const submit = this.sdk.auction.start
			.before(async (request: IStartAuctionRequest) => {
				const { itemId } = getEthereumItemId(request.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				return {
					makeAssetType: { tokenId: item.tokenId, contract: item.contract },
					amount: toBigNumber(request.amount.toString()),
					takeAssetType: getEthTakeAssetType(request.currency),
					minimalStepDecimal: request.minimalStep,
					minimalPriceDecimal: request.minimalPrice,
					duration: request.duration,
					startTime: request.startTime,
					buyOutPriceDecimal: request.buyOutPrice,
					payouts: toEthereumParts(request.payouts),
					originFees: toEthereumParts(request.originFees),
				}
			})
      .after()

		return {
			multiple: collection.type === "ERC1155",
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit,
		}
	}
}
