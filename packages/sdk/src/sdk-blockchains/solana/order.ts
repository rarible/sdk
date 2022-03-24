import { Blockchain, OrderStatus, Platform } from "@rarible/api-client"
import type { Order } from "@rarible/api-client"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { Action } from "@rarible/action"
import { toBigNumber, toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
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
import { getMintId, getOrderData, getPreparedOrder, getPrice, getTokensAmount } from "./common/order"

export class SolanaOrder {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {
		this.sell = this.sell.bind(this)
		this.bid = this.bid.bind(this)
	}

	async sell(request: OrderCommon.PrepareOrderInternalRequest): Promise<OrderCommon.PrepareOrderInternalResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				const res = await this.sdk.order.sell({
					auctionHouse: getAuctionHouse("SOL"),
					signer: this.wallet!.provider,
					mint: extractPublicKey(request.itemId),
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
				})

				return toOrderId(`SOLANA:${res.txId}`) //todo how to pick orderid?
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE, //todo check this
			payoutsSupport: PayoutsSupport.NONE, //todo check this
			multiple: true, //todo check
			supportedCurrencies: [{ blockchain: Blockchain.SOLANA, type: "NATIVE" }], //todo check
			baseFee: 0, //await this.sdk.order.getBaseOrderFee(), //todo check this
			supportsExpirationDate: true, //todo check
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
				const res = await this.sdk.order.sell({
					auctionHouse: getAuctionHouse("SOL"),
					signer: this.wallet!.provider,
					mint: getMintId(order),
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
				})

				return toOrderId(`SOLANA:${res.txId}`) //todo check
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE, //todo check this
			payoutsSupport: PayoutsSupport.NONE, //todo check this
			supportedCurrencies: [{ blockchain: Blockchain.SOLANA, type: "NATIVE" }], //todo check
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

				const res = await this.sdk.order.buy({
					auctionHouse: getAuctionHouse("SOL"),
					signer: this.wallet!.provider,
					mint: extractPublicKey(prepare.itemId),
					price: parseFloat(request.price.toString()),
					tokensAmount: request.amount,
				})

				return toOrderId(`SOLANA:${res.txId}`)
			},
		})

		return {
			multiple: true, //todo check
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.NONE, //todo check
			payoutsSupport: PayoutsSupport.NONE, //todo check
			supportedCurrencies: [{ blockchain: Blockchain.SOLANA, type: "NATIVE" }], //todo check
			baseFee: 0, //todo check
			getConvertableValue: this.getConvertableValue, //todo check
			supportsExpirationDate: false, //todo check
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
				const res = await this.sdk.order.buy({
					auctionHouse: getAuctionHouse("SOL"),
					signer: this.wallet!.provider,
					mint: getMintId(order),
					price: parseFloat(updateRequest.price.toString()),
					tokensAmount: getTokensAmount(order),
				})

				return toOrderId(`SOLANA:${res.txId}`) //todo check
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.NONE, //todo check
			payoutsSupport: PayoutsSupport.NONE, //todo check
			supportedCurrencies: [{ blockchain: Blockchain.SOLANA, type: "NATIVE" }], //todo check
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
