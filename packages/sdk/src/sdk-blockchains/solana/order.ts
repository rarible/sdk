import { OrderStatus, Platform } from "@rarible/api-client"
import type { Order } from "@rarible/api-client"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toBigNumber, toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import { toPublicKey } from "@rarible/solana-common"
import type * as OrderCommon from "../../types/order/common"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { PrepareBidRequest, PrepareBidResponse } from "../../types/order/bid/domain"
import type { OrderRequest } from "../../types/order/common"
import type { GetConvertableValueResult } from "../../types/order/bid/domain"
import type { OrderUpdateRequest, PrepareOrderUpdateRequest, PrepareOrderUpdateResponse } from "../../types/order/common"
import type { PrepareBidUpdateResponse } from "../../types/order/bid/domain"
import { getAuctionHouse } from "./common/auction-house"
import { extractPublicKey } from "./common/address-converters"
import { getMintId, getOrderData, getOrderId, getPreparedOrder, getPrice, getTokensAmount } from "./common/order"
import { getCurrencies } from "./common/currencies"

export class SolanaOrder {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {
		this.sell = this.sell.bind(this)
		this.bid = this.bid.bind(this)
		this.sellUpdate = this.sellUpdate.bind(this)
		this.bidUpdate = this.bidUpdate.bind(this)
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				const mint = extractPublicKey(request.itemId)
				const auctionHouse = getAuctionHouse("SOL")

				const res = await this.sdk.order.sell({
					auctionHouse: getAuctionHouse("SOL"),
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
				})

				return getOrderId(
					this.wallet!.provider.publicKey.toString(),
					mint.toString(),
					auctionHouse.toString()
				)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			multiple: true,
			supportedCurrencies: getCurrencies(),
			baseFee: 0, //await this.sdk.order.getBaseOrderFee(), //todo check this
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
				const auctionHouse = toPublicKey(getOrderData(order).auctionHouse!)

				const res = await this.sdk.order.sell({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
				})

				return getOrderId(
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
			baseFee: 0, //await this.sdk.order.getBaseOrderFee(), //todo check this
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

		const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderRequest) => {
				const mint = extractPublicKey(prepare.itemId)
				const auctionHouse = getAuctionHouse("SOL")

				const res = await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
				})

				return toOrderId(`SOLANA:${res.txId}`)
			},
		})

		return {
			multiple: true,
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			supportedCurrencies: getCurrencies(),
			baseFee: 0, //todo check
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
				const auctionHouse = toPublicKey(getOrderData(order).auctionHouse!)

				const res = await this.sdk.order.buy({
					auctionHouse: auctionHouse,
					signer: this.wallet!.provider,
					mint: mint,
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
				})

				return getOrderId(
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
			baseFee: 0, // todo check
			getConvertableValue: this.getConvertableValue,
			submit: updateAction,
		}
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			//const order = await getPreparedOrder(request, this.apis)

			const order = { // todo remove mock
				id: toOrderId("SOLANA:1111111"),
				fill: toBigNumber("1"),
				platform: Platform.RARIBLE,
				status: OrderStatus.ACTIVE,
				makeStock: toBigNumber("1"),
				cancelled: false,
				createdAt: "2022-03-15:10:00:00",
				lastUpdatedAt: "2022-03-15:10:00:00",
				makePrice: toBigNumber("0.001"),
				takePrice: toBigNumber("0.001"),
				maker: toUnionAddress("SOLANA:1111"),
				taker: undefined,
				make: {
					type: { "@type": "SOLANA_NFT", itemId: (request as any).itemId },
					value: toBigNumber("1"),
				},
				take: {
					type: { "@type": "SOLANA_SOL" },
					value: toBigNumber("0.001"),
				},
				salt: "salt",
				data: {
					"@type": "SOLANA_AUCTION_HOUSE_V1",
					auctionHouse: toContractAddress("SOLANA:" + getAuctionHouse("SOL").toString()),
				},
			} as Order
			const orderData = getOrderData(order)

			const tx = await this.sdk.order.cancel({
				auctionHouse: extractPublicKey(orderData.auctionHouse!),
				signer: this.wallet!.provider,
				mint: getMintId(order),
				price: getPrice(order),
				tokensAmount: getTokensAmount(order),
			})

			return new BlockchainSolanaTransaction(tx, this.sdk)
		},
	})
}
