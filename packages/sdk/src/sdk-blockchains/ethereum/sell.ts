import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import { ItemId } from "@rarible/api-client"
import {
	OrderInternalRequest,
	OrderUpdateRequest,
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import {
	convertOrderHashToOrderId,
	convertUnionToEthereumAddress,
	getEthTakeAssetType,
	getSupportedCurrencies,
} from "./common"

export class SellInternal {
	constructor(private sdk: RaribleSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		const [domain, contract] = request.collectionId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				return {
					makeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					amount: sellFormRequest.amount,
					takeAssetType: getEthTakeAssetType(sellFormRequest.currency),
					priceDecimal: sellFormRequest.price,
					payouts: sellFormRequest.payouts?.map(p => ({
						account: convertUnionToEthereumAddress(p.account),
						value: p.value,
					})) || [],
					originFees: sellFormRequest.originFees?.map(fee => ({
						account: convertUnionToEthereumAddress(fee.account),
						value: fee.value,
					})) || [],
				}
			})
			.after(order => convertOrderHashToOrderId(order.hash))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			multiple: collection.type === "ERC1155",
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellAction,
		}
	}

	async update(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (blockchain !== "ETHEREUM") {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({ hash })
		if (order.type !== "RARIBLE_V2" && order.type !== "RARIBLE_V1") {
			throw new Error(`Unable to update bid ${JSON.stringify(order)}`)
		}

		const sellUpdateAction = this.sdk.order.sellUpdate
			.before((request: OrderUpdateRequest) => {
				return {
					orderHash: toWord(hash),
					priceDecimal: request.price,
				}
			})
			.after(order => convertOrderHashToOrderId(order.hash))

		return {
			originFeeSupport: order.type === "RARIBLE_V2" ? OriginFeeSupport.FULL : OriginFeeSupport.AMOUNT_ONLY,
			payoutsSupport: order.type === "RARIBLE_V2" ? PayoutsSupport.MULTIPLE : PayoutsSupport.SINGLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
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
