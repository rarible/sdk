import BigNumber from "bignumber.js"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { Order, OrderId } from "@rarible/api-client"
import type { PublicKey } from "@solana/web3.js"
import type * as OrderCommon from "../../types/order/common"
import type {
	OrderRequest,
	OrderUpdateRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest, ICancelAction } from "../../types/order/cancel/domain"
import type {
	GetConvertableValueResult,
	PrepareBidRequest,
	PrepareBidResponse,
	PrepareBidUpdateResponse,
} from "../../types/order/bid/domain"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type { SellSimplifiedRequest } from "../../types/order/sell/simplified"
import type { SellUpdateSimplifiedRequest } from "../../types/order/sell/simplified"
import type { BidSimplifiedRequest } from "../../types/order/bid/simplified"
import type { BidUpdateSimplifiedRequest } from "../../types/order/bid/simplified"
import { getAuctionHouse, getAuctionHouseFee } from "./common/auction-house"
import { extractPublicKey } from "./common/address-converters"
import { getMintId, getOrderData, getOrderId, getPreparedOrder, getPrice, getTokensAmount } from "./common/order"
import { getCurrencies } from "./common/currencies"
import type { ISolanaSdkConfig } from "./domain"

export class SolanaOrder {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
		this.sell = this.sell.bind(this)
		this.bid = this.bid.bind(this)
		this.sellUpdate = this.sellUpdate.bind(this)
		this.bidUpdate = this.bidUpdate.bind(this)
		this.sellBasic = this.sellBasic.bind(this)
		this.sellUpdateBasic = this.sellUpdateBasic.bind(this)
		this.bidBasic = this.bidBasic.bind(this)
		this.cancelBasic = this.cancelBasic.bind(this)
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const auctionHouse = getAuctionHouse({ "@type": "SOLANA_SOL" }, this.config?.auctionHouseMapping)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				return this.sellCommon(request, auctionHouse)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getCurrencies(),
			baseFee: await getAuctionHouseFee(auctionHouse, this.config?.auctionHouseMapping),
			supportsExpirationDate: false,
			submit: submit,
		}
	}

	async sellCommon(request: OrderCommon.OrderInternalRequest, auctionHouse: PublicKey) {
		const mint = extractPublicKey(request.itemId)
		const amount = request.amount !== undefined ? request.amount: 1

		await (await this.sdk.order.sell({
			auctionHouse: auctionHouse,
			signer: this.wallet!.provider,
			mint: mint,
			price: new BigNumber(request.price).multipliedBy(amount),
			tokensAmount: amount,
		})).submit("processed")

		return getOrderId(
			"SELL",
			this.wallet!.provider.publicKey.toString(),
			mint.toString(),
			auctionHouse.toString()
		)
	}

	async sellBasic(request: SellSimplifiedRequest): Promise<OrderId> {
		const response = await this.sell()
		return response.submit(request)
	}

	async sellUpdate(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const order = await getPreparedOrder(prepareRequest, this.apis)
		const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)

		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				return this.sellUpdateCommon(updateRequest, order)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getCurrencies(),
			baseFee: await getAuctionHouseFee(auctionHouse, this.config?.auctionHouseMapping),
			submit: updateAction,
		}
	}

	async sellUpdateCommon(updateRequest: OrderUpdateRequest, order: Order) {
		const amount = getTokensAmount(order)
		const mint = getMintId(order)
		const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)

		await (await this.sdk.order.sell({
			auctionHouse: auctionHouse,
			signer: this.wallet!.provider,
			mint: mint,
			price: new BigNumber(updateRequest.price).multipliedBy(amount),
			tokensAmount: amount,
		})).submit("processed")


		return getOrderId(
			"SELL",
			this.wallet!.provider.publicKey.toString(),
			mint.toString(),
			auctionHouse.toString()
		)
	}

	async sellUpdateBasic(request: SellUpdateSimplifiedRequest): Promise<OrderId> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const order = await getPreparedOrder(request, this.apis)
		return this.sellUpdateCommon(request, order)
	}

	private async getConvertableValue(): Promise<GetConvertableValueResult> {
		return undefined
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		if (!("itemId" in prepare)) {
			throw new Error("No ItemId provided")
		}
		const auctionHouse = getAuctionHouse({ "@type": "SOLANA_SOL" }, this.config?.auctionHouseMapping)

		const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const mint = extractPublicKey(prepare.itemId)

				const amount = request.amount !== undefined ? request.amount: 1

				await (await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: new BigNumber(request.price).multipliedBy(amount),
					tokensAmount: amount,
				})).submit("processed")

				return getOrderId(
					"BUY",
					this.wallet!.provider.publicKey.toString(),
					mint.toString(),
					auctionHouse.toString()
				)
			},
		})

		return {
			multiple: parseFloat(item.supply) > 1,
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getCurrencies(),
			baseFee: 0,
			getConvertableValue: this.getConvertableValue,
			supportsExpirationDate: false,
			submit,
		}
	}

	async bidBasic(request: BidSimplifiedRequest): Promise<OrderId> {
		const response = await this.bid(request)
		return response.submit(request)
	}

	async bidUpdate(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const order = await getPreparedOrder(prepareRequest, this.apis)
		const amount = getTokensAmount(order)

		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const mint = getMintId(order)
				const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)

				await (await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: new BigNumber(updateRequest.price).multipliedBy(amount),
					tokensAmount: amount,
				})).submit("processed")

				return getOrderId(
					"BUY",
					this.wallet!.provider.publicKey.toString(),
					mint.toString(),
					auctionHouse.toString()
				)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getCurrencies(),
			baseFee: 0,
			getConvertableValue: this.getConvertableValue,
			submit: updateAction,
		}
	}

	async bidUpdateBasic(request: BidUpdateSimplifiedRequest): Promise<OrderId> {
		const updateResponse = await this.bidUpdate(request)
		return updateResponse.submit(request)
	}

	cancel: ICancelAction = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			const order = await getPreparedOrder(request, this.apis)
			const orderData = getOrderData(order)
			const amount = getTokensAmount(order)

			const res = await (await this.sdk.order.cancel({
				auctionHouse: extractPublicKey(orderData.auctionHouse!),
				signer: this.wallet!.provider,
				mint: getMintId(order),
				price: getPrice(order),
				tokensAmount: amount,
			})).submit("processed")

			return new BlockchainSolanaTransaction(res, this.sdk)
		},
	})

	async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		return this.cancel(request)
	}
}
