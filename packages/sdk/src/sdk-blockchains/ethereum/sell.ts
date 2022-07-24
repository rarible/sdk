import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { OrderId } from "@rarible/api-client"
import type { SellRequest } from "@rarible/protocol-ethereum-sdk/build/order/sell"
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import type { SellUpdateSimplifiedRequest } from "../../types/order/sell/simplified"
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
		this.sellBasic = this.sellBasic.bind(this)
		this.sellUpdateBasic = this.sellUpdateBasic.bind(this)
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				return this.sellCommon(sellFormRequest)
			})
			.after(order => common.convertEthereumOrderHash(order.hash, this.blockchain))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			supportsExpirationDate: true,
			submit: sellAction,
		}
	}

	async sellCommon(sellFormRequest: OrderCommon.OrderInternalRequest): Promise<SellRequest> {
		const { itemId } = getEthereumItemId(sellFormRequest.itemId)
		const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
		const expirationDate = sellFormRequest.expirationDate instanceof Date
			? Math.floor(sellFormRequest.expirationDate.getTime() / 1000)
			: undefined
		const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)
		const amount = sellFormRequest.amount ?? 1
		return {
			makeAssetType: {
				tokenId: item.tokenId,
				contract: item.contract,
			},
			amount: amount,
			takeAssetType: common.getEthTakeAssetType(currencyAssetType),
			priceDecimal: sellFormRequest.price,
			payouts: common.toEthereumParts(sellFormRequest.payouts),
			originFees: common.toEthereumParts(sellFormRequest.originFees),
			end: expirationDate,
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

	async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
		const sellData = await this.sellCommon(request)
		const sellOrderId = await this.sdk.order.sell(sellData)
		return common.convertEthereumOrderHash(sellOrderId.hash, this.blockchain)
	}

	async sellUpdateBasic(request: SellUpdateSimplifiedRequest): Promise<OrderId> {
		if (!request.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, hash] = request.orderId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error("Not an ethereum order")
		}

		const order = await this.sdk.apis.order.getOrderByHash({ hash })
		if (order.type !== "RARIBLE_V2" && order.type !== "RARIBLE_V1") {
			throw new Error(`Unable to update sell ${JSON.stringify(order)}`)
		}

		const sellUpdateData = {
			orderHash: toWord(hash),
			priceDecimal: request.price,
		}
		const updatedOrder = await this.sdk.order.sellUpdate(sellUpdateData)
		return common.convertEthereumOrderHash(updatedOrder.hash, this.blockchain)
	}

}
