import { toBigNumber } from "@rarible/types/build/big-number"
import { Action } from "@rarible/action"
import type { Order } from "@rarible/api-client"
import { OrderStatus, Platform } from "@rarible/api-client"
import { toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import type { PublicKey } from "@solana/web3.js"
import { toPublicKey } from "@rarible/solana-common"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction/build/solana"
import type { IApisSdk } from "../../domain"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { getAuctionHouse } from "./common/auction-house"

async function getMockedOrder(itemId: string, maker: string, taker: string): Promise<Order> {
	return {
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
		maker: toUnionAddress("SOLANA:" + maker),
		taker: toUnionAddress("SOLANA:" + taker),
		make: {
			type: { "@type": "SOLANA_NFT", itemId: toItemId(itemId) },
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
	}
}

export class SolanaFill {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {
		this.fill = this.fill.bind(this)
	}

	private async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		}
		if ("orderId" in request) {
			return this.apis.order.getOrderById({ id: request.orderId })
		}
		throw new Error("Incorrect request")
	}

	private getMintId(order: Order): PublicKey {
		if (order.make.type["@type"] === "SOLANA_NFT") {
			return toPublicKey(order.make.type.itemId.split(":")[1])
		}
		throw new Error("Unsupported type")
	}

	private getPrice(order: Order): number {
		if (order.take.type["@type"] === "SOLANA_SOL") {
			return parseFloat(order.take.value.toString())
		}
		throw new Error("Unsupported currency type")
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const order = await getMockedOrder((request as any).mint, (request as any).maker, (request as any).taker)
		//const order =this.getPreparedOrder(request)
		const submit = Action
			.create({
				id: "send-tx" as const,
				run: async (buyRequest: FillRequest) => {
					// todo: unite transactions in one call
					const buyResult = await this.sdk.order.buy({
						auctionHouse: getAuctionHouse("SOL"),
						signer: this.wallet!.provider,
						mint: this.getMintId(order),
						price: this.getPrice(order),
						tokensAmount: buyRequest.amount,
					})

					await this.sdk.confirmTransaction(buyResult.txId, "max")

					const res = await this.sdk.order.executeSell({
						auctionHouse: getAuctionHouse("SOL"),
						signer: this.wallet!.provider,
						buyerWallet: toPublicKey(order.taker!.split(":")[1]),
						sellerWallet: toPublicKey(order.maker!.split(":")[1]),
						mint: this.getMintId(order),
						price: this.getPrice(order),
						tokensAmount: buyRequest.amount,
					})

					return res
				},
			})
			.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			baseFee: 0, //todo check this
			supportsPartialFill: false,
			originFeeSupport: OriginFeeSupport.FULL, //todo check this
			payoutsSupport: PayoutsSupport.NONE, //todo check this
			submit,
		}
	}
}
