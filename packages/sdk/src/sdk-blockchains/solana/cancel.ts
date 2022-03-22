import { Action } from "@rarible/action"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction/build/solana"
import type { Order } from "@rarible/api-client"
import { OrderStatus, Platform } from "@rarible/api-client"
import { toBigNumber, toContractAddress, toOrderId, toUnionAddress } from "@rarible/types"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import { getMintId, getOrderData, getPrice } from "./common/order"
import { extractPublicKey } from "./common/address-converters"
import { getAuctionHouse } from "./common/auction-house"

export class SolanaCancel {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {
	}

	private async getPreparedOrder(request: CancelOrderRequest): Promise<Order> {
		if ("orderId" in request) {
			return this.apis.order.getOrderById({ id: request.orderId })
		}
		throw new Error("Incorrect request")
	}

	getAmount(order: Order): number {
		if (order.make.type["@type"] === "SOLANA_NFT") {
			return parseFloat(order.make.value.toString())
		}
		throw new Error("Unsupported asset type")
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			//const order = await this.getPreparedOrder(request)

			const order = {
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
				tokensAmount: this.getAmount(order),
			})

			return new BlockchainSolanaTransaction(tx, this.sdk)
		},
	})
}
