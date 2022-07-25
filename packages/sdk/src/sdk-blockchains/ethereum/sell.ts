import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type * as OrderCommon from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { EVMBlockchain } from "./common"
import * as common from "./common"
import {
	getEthereumItemId,
	getEVMBlockchain,
	getOriginFeeSupport,
	getPayoutsSupport,
	isEVMBlockchain,
	validateOrderDataV3Request,
} from "./common"
import type { IEthereumSdkConfig } from "./domain"

export class EthereumSell {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
		private config?: IEthereumSdkConfig
	) {
		this.blockchain = getEVMBlockchain(network)
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		if (this.config?.useDataV3) {
			return this.sellDataV3()
		} else {
			return this.sellDataV2()
		}
	}

	private async sellDataV2(): Promise<PrepareSellInternalResponse> {
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				const expirationDate = sellFormRequest.expirationDate instanceof Date
					? Math.floor(sellFormRequest.expirationDate.getTime() / 1000)
					: undefined
				const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)
				return {
					type: "DATA_V2",
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
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			supportsExpirationDate: true,
			submit: sellAction,
		}
	}

	async sellDataV3(): Promise<PrepareSellInternalResponse> {
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				validateOrderDataV3Request(sellFormRequest, { shouldProvideMaxFeesBasePoint: true })

				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				const expirationDate = sellFormRequest.expirationDate instanceof Date
					? Math.floor(sellFormRequest.expirationDate.getTime() / 1000)
					: undefined
				const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)

				const payouts = common.toEthereumParts(sellFormRequest.payouts)
				const originFees = common.toEthereumParts(sellFormRequest.originFees)

				return {
					type: "DATA_V3_SELL",
					makeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					payout: payouts[0],
					originFeeFirst: originFees[0],
					originFeeSecond: originFees[1],
					maxFeesBasePoint: sellFormRequest.maxFeesBasePoint ?? 0,
					marketplaceMarker: this.config?.marketplaceMarker ? toWord(this.config?.marketplaceMarker) : undefined,
					amount: sellFormRequest.amount,
					takeAssetType: common.getEthTakeAssetType(currencyAssetType),
					priceDecimal: sellFormRequest.price,
					end: expirationDate,
				}
			})
			.after(order => common.convertEthereumOrderHash(order.hash, this.blockchain))

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.SINGLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.REQUIRED,
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
			originFeeSupport: getOriginFeeSupport(order.type),
			payoutsSupport: getPayoutsSupport(order.type),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(order.type),
			submit: sellUpdateAction,
		}
	}
}
