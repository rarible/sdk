import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toAddress, toWord } from "@rarible/types"
import type { OrderId } from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleEthereumApis } from "@rarible/protocol-ethereum-sdk/build/common/apis"
import { extractBlockchain } from "@rarible/sdk-common"
import type * as OrderCommon from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest, SellUpdateSimplifiedRequest } from "../../types/order/sell/simplified"
import { convertDateToTimestamp, getDefaultExpirationDateTimestamp } from "../../common/get-expiration-date"
import { checkPayouts } from "../../common/check-payouts"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import type { IApisSdk } from "../../domain"
import * as common from "./common"
import {
	checkWalletBlockchain,
	convertEthereumContractAddress,
	getEthereumItemId, getEthOrder,
	getOriginFeeSupport,
	getPayoutsSupport, getWalletBlockchain,
	isEVMBlockchain, isRaribleOrderData, isRaribleV1Data, isRaribleV2Data,
	validateOrderDataV3Request,
} from "./common"
import type { IEthereumSdkConfig } from "./domain"

export class EthereumSell {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private apis: IApisSdk,
		private config?: IEthereumSdkConfig
	) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
		this.sellBasic = this.sellBasic.bind(this)
		this.sellUpdateBasic = this.sellUpdateBasic.bind(this)
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		if (this.config?.useDataV3) {
			return this.sellDataV3()
		} else {
			return this.sellDataV2()
		}
	}

	async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
		const prepare = await this.sell()
		return prepare.submit(request)
	}

	async sellUpdateBasic(request: SellUpdateSimplifiedRequest): Promise<OrderId> {
		const prepare = await this.update(request)
		return prepare.submit(request)
	}

	async getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
		return {
			originFeeSupport: OriginFeeSupport.FULL,
			baseFee: await this.sdk.order.getBaseOrderFee(),
		}
	}

	private async sellDataV2(): Promise<PrepareSellInternalResponse> {
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderCommon.OrderInternalRequest) => {
				await checkWalletBlockchain(this.wallet, extractBlockchain(sellFormRequest.itemId))
				checkPayouts(sellFormRequest.payouts)
				const { tokenId, contract } = getEthereumItemId(sellFormRequest.itemId)
				const expirationDate = sellFormRequest.expirationDate
					? convertDateToTimestamp(sellFormRequest.expirationDate)
					: getDefaultExpirationDateTimestamp()
				const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)
				return {
					type: "DATA_V2",
					makeAssetType: {
						tokenId: tokenId,
						contract: toAddress(contract),
					},
					amount: sellFormRequest.amount ?? 1,
					takeAssetType: common.getEthTakeAssetType(currencyAssetType),
					priceDecimal: sellFormRequest.price,
					payouts: common.toEthereumParts(sellFormRequest.payouts),
					originFees: common.toEthereumParts(sellFormRequest.originFees),
					end: expirationDate,
				}
			})
			.after(async order => {
				//todo replace with returned chainId/blockchain
				const blockchain = await getWalletBlockchain(this.wallet)
				return common.convertEthereumOrderHash(order.hash, blockchain)
			})

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
				await checkWalletBlockchain(this.wallet, extractBlockchain(sellFormRequest.itemId))
				validateOrderDataV3Request(sellFormRequest, { shouldProvideMaxFeesBasePoint: true })

				const { tokenId, contract } = getEthereumItemId(sellFormRequest.itemId)
				const expirationDate = sellFormRequest.expirationDate
					? convertDateToTimestamp(sellFormRequest.expirationDate)
					: getDefaultExpirationDateTimestamp()

				const currencyAssetType = getCurrencyAssetType(sellFormRequest.currency)

				const payouts = common.toEthereumParts(sellFormRequest.payouts)
				const originFees = common.toEthereumParts(sellFormRequest.originFees)

				return {
					type: "DATA_V3_SELL",
					makeAssetType: {
						tokenId: tokenId,
						contract: toAddress(contract),
					},
					payout: payouts[0],
					originFeeFirst: originFees[0],
					originFeeSecond: originFees[1],
					maxFeesBasePoint: sellFormRequest.maxFeesBasePoint ?? 0,
					amount: sellFormRequest.amount ?? 1,
					takeAssetType: common.getEthTakeAssetType(currencyAssetType),
					priceDecimal: sellFormRequest.price,
					end: expirationDate,
				}
			})
			.after(async order => {
				const blockchain = await getWalletBlockchain(this.wallet)
				return common.convertEthereumOrderHash(order.hash, blockchain)
			})

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

		const order = await this.apis.order.getValidatedOrderById({
			id: prepareRequest.orderId,
		})
		if (!isRaribleV1Data(order.data) && !isRaribleV2Data(order.data)) {
			throw new Error(`You can't update non-Rarible orders. Unable to update sell ${JSON.stringify(order)}`)
		}

		const sellUpdateAction = this.sdk.order.sellUpdate
			.before(async (request: OrderCommon.OrderUpdateRequest) => {
				await checkWalletBlockchain(this.wallet, blockchain)
				return {
					orderHash: toWord(hash),
					priceDecimal: request.price,
				}
			})
			.after(order => common.convertEthereumOrderHash(order.hash, blockchain))

		return {
			originFeeSupport: getOriginFeeSupport(order.data),
			payoutsSupport: getPayoutsSupport(order.data),
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: common.getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(getEthOrder(order).type as "RARIBLE_V1" | "RARIBLE_V2"),
			submit: sellUpdateAction,
			orderData: {
				nftCollection: "contract" in order.make.type ? order.make.type.contract : undefined,
			},
		}
	}
}
