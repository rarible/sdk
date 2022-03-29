import { toBigNumber } from "@rarible/types/build/big-number"
import { Action } from "@rarible/action"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import type { Order } from "@rarible/api-client"
import { OrderStatus } from "@rarible/api-client"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { IApisSdk } from "../../domain"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { extractPublicKey } from "./common/address-converters"
import { getMintId, getOrderData, getPreparedOrder, getPrice } from "./common/order"
import { getAuctionHouseFee } from "./common/auction-house"

export class SolanaFill {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
	) {
		this.fill = this.fill.bind(this)
	}

	private isBuyOrder(order: Order): boolean {
		return order.make.type["@type"] === "SOLANA_NFT"
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}

		const order = await getPreparedOrder(request, this.apis)
		if (order.status !== OrderStatus.ACTIVE) {
			throw new Error("Order is not active")
		}
		return this.isBuyOrder(order) ? this.buy(order) : this.acceptBid(order)
	}

	private async buy(order: Order): Promise<PrepareFillResponse> {
		const submit = Action
			.create({
				id: "send-tx" as const,
				run: async (buyRequest: FillRequest) => {
					const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)
					const mint = getMintId(order)
					const price = getPrice(order)

					// todo: unite transactions in one call
					const buyResult = await this.sdk.order.buy({
						auctionHouse: auctionHouse,
						signer: this.wallet!.provider,
						mint: mint,
						price: price,
						tokensAmount: buyRequest.amount,
					})

					await this.sdk.confirmTransaction(buyResult.txId, "max")

					const res = await this.sdk.order.executeSell({
						auctionHouse: auctionHouse,
						signer: this.wallet!.provider,
						buyerWallet: this.wallet!.provider.publicKey,
						sellerWallet: extractPublicKey(order.maker!),
						mint: mint,
						price: price,
						tokensAmount: buyRequest.amount,
					})

					return res
				},
			})
			.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

		return {
			multiple: true,
			maxAmount: toBigNumber("1"),
			baseFee: 0, // todo 0 if buy, use ah fee on fill sell or acceptbid
			supportsPartialFill: true,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}

	private async acceptBid(order: Order): Promise<PrepareFillResponse> {
		const submit = Action
			.create({
				id: "send-tx" as const,
				run: async (buyRequest: FillRequest) => {
					const auctionHouse = extractPublicKey(getOrderData(order).auctionHouse!)
					const mint = getMintId(order)
					const price = getPrice(order)

					// todo: unite transactions in one call
					const buyResult = await this.sdk.order.sell({
						auctionHouse: auctionHouse,
						signer: this.wallet!.provider,
						mint: mint,
						price: price,
						tokensAmount: buyRequest.amount,
					})

					await this.sdk.confirmTransaction(buyResult.txId, "max")

					const res = await this.sdk.order.executeSell({
						auctionHouse: auctionHouse,
						signer: this.wallet!.provider,
						buyerWallet: extractPublicKey(order.maker!),
						sellerWallet: this.wallet!.provider.publicKey,
						mint: mint,
						price: price,
						tokensAmount: buyRequest.amount,
					})

					return res
				},
			})
			.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

		return {
			multiple: true,
			maxAmount: toBigNumber("1"),
			baseFee: await getAuctionHouseFee(getOrderData(order).auctionHouse!), // todo check this
			supportsPartialFill: true,
			originFeeSupport: OriginFeeSupport.NONE,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}

}
