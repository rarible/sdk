import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import type { ItemId } from "@rarible/api-client"
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import * as common from "./common"

export class EthereumSell {
	constructor(private sdk: RaribleSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		const [domain, contract] = request.collectionId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				return {
					makeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					amount: sellFormRequest.amount,
					takeAssetType: common.getEthTakeAssetType(sellFormRequest.currency),
					priceDecimal: sellFormRequest.price,
					payouts: common.toEthereumParts(sellFormRequest.payouts),
					originFees: common.toEthereumParts(sellFormRequest.originFees),
				}
			})
			.after(order => common.convertEthereumOrderHash(order.hash))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			multiple: collection.type === "ERC1155",
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellAction,
		}
	}

	async update(prepareRequest: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (blockchain !== "ETHEREUM") {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({ hash })
		if (order.type !== "RARIBLE_V2" && order.type !== "RARIBLE_V1") {
			throw new Error(`Unable to update sell ${JSON.stringify(order)}`)
		}

		const sellUpdateAction = this.sdk.order.sellUpdate
			.before((request: OrderCommon.OrderUpdateRequest) => ({
				orderHash: toWord(hash),
				priceDecimal: request.price,
			}))
			.after(order => common.convertEthereumOrderHash(order.hash))

		return {
			originFeeSupport: order.type === "RARIBLE_V2" ? OriginFeeSupport.FULL : OriginFeeSupport.AMOUNT_ONLY,
			payoutsSupport: order.type === "RARIBLE_V2" ? PayoutsSupport.MULTIPLE : PayoutsSupport.SINGLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(order.type),
			submit: sellUpdateAction,
		}
	}
}

function getEthereumItemId(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== "ETHEREUM") {
		throw new Error(`Not an ethereum item: ${itemId}`)
	}
	return {
		itemId: `${contract}:${tokenId}`,
		contract,
		tokenId,
		domain,
	}
}
