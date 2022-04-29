import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type * as OrderCommon from "../../types/order/common"
import type {
	OrderRequest,
	OrderUpdateRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type {
	GetConvertableValueResult,
	PrepareBidRequest,
	PrepareBidResponse,
	PrepareBidUpdateResponse,
} from "../../types/order/bid/domain"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import { getAuctionHouse, getAuctionHouseFee } from "./common/auction-house"
import { extractAddress, extractPublicKey } from "./common/address-converters"
import { getMintId, getOrderData, getOrderId, getPreparedOrder, getPrice, getTokensAmount } from "./common/order"
import { getCurrencies } from "./common/currencies"
import type { ISolanaSdkConfig } from "./domain"

const WRAPPED_SOL = "So11111111111111111111111111111111111111112"

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
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const auctionHouse = getAuctionHouse({ "@type": "SOLANA_SOL" }, this.config?.auctionHouseMapping)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				const mint = extractPublicKey(request.itemId)

				await (await this.sdk.order.sell({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
				})).submit("processed")

				return getOrderId(
					"SELL",
					this.wallet!.provider.publicKey.toString(),
					mint.toString(),
					auctionHouse.toString()
				)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: getCurrencies(),
			baseFee: await getAuctionHouseFee(auctionHouse),
			supportsExpirationDate: false,
			submit: submit,
		}
	}

	async sellUpdate(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const order = await getPreparedOrder(prepareRequest, this.apis)

		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const mint = getMintId(order)
				const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)

				await (await this.sdk.order.sell({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
				})).submit("processed")


				return getOrderId(
					"SELL",
					this.wallet!.provider.publicKey.toString(),
					mint.toString(),
					auctionHouse.toString()
				)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: getCurrencies(),
			baseFee: await getAuctionHouseFee(extractAddress(getOrderData(order).auctionHouse!)),
			submit: updateAction,
		}
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

				await (await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
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
			supportedCurrencies: getCurrencies(),
			baseFee: 0,
			getConvertableValue: this.getConvertableValue,
			supportsExpirationDate: false,
			submit,
		}
	}

	async bidUpdate(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareBidUpdateResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const order = await getPreparedOrder(prepareRequest, this.apis)

		const updateAction = Action.create({
			id: "send-tx" as const,
			run: async (updateRequest: OrderUpdateRequest) => {
				const mint = getMintId(order)
				const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)

				await (await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
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
			supportedCurrencies: getCurrencies(),
			baseFee: 0,
			getConvertableValue: this.getConvertableValue,
			submit: updateAction,
		}
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			const order = await getPreparedOrder(request, this.apis)
			const orderData = getOrderData(order)

			const res = await (await this.sdk.order.cancel({
				auctionHouse: extractPublicKey(orderData.auctionHouse!),
				signer: this.wallet!.provider,
				mint: getMintId(order),
				price: getPrice(order),
				tokensAmount: getTokensAmount(order),
			})).submit("processed")

			return new BlockchainSolanaTransaction(res, this.sdk)
		},
	})
}
