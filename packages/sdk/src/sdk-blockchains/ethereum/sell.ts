import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import * as common from "./common"
import type { EVMBlockchain } from "./common"
import { getEthereumItemId, getEVMBlockchain, isEVMBlockchain } from "./common"

export class EthereumSell {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		const [domain, contract] = request.collectionId.split(":")
		if (!isEVMBlockchain(domain)) {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				const expirationDate = sellFormRequest.expirationDate instanceof Date
					? Math.round(sellFormRequest.expirationDate.getTime() / 1000)
					: undefined
				const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)
				return {
					makeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					amount: sellFormRequest.amount,
					takeAssetType: common.getEthTakeAssetType(currencyAssetType),
					priceDecimal: sellFormRequest.price,
					payouts: common.toEthereumParts(sellFormRequest.payouts),
					originFees: common.toEthereumParts(sellFormRequest.originFees),
					end: expirationDate,
				}
			})
			.after(order => common.convertEthereumOrderHash(order.hash, this.blockchain))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			multiple: collection.type === "ERC1155",
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			supportsExpirationDate: true,
			submit: sellAction,
		}
	}

	async update(prepareRequest: OrderCommon.PrepareOrderUpdateRequest): Promise<OrderCommon.PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = prepareRequest.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
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
			.after(order => common.convertEthereumOrderHash(order.hash, this.blockchain))

		return {
			originFeeSupport: order.type === "RARIBLE_V2" ? OriginFeeSupport.FULL : OriginFeeSupport.AMOUNT_ONLY,
			payoutsSupport: order.type === "RARIBLE_V2" ? PayoutsSupport.MULTIPLE : PayoutsSupport.SINGLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(order.type),
			submit: sellUpdateAction,
		}
	}
}
