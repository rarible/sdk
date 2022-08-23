import type { RaribleImxSdk } from "@rarible/immutable-sdk/src/domain"
import { BlockchainImmutableXTransaction } from "@rarible/sdk-transaction"
import { toAddress, toBigNumber, toOrderId } from "@rarible/types"
import { OrderStatus } from "@rarible/api-client"
import { Action } from "@rarible/action"
import type { Erc721AssetRequest } from "@rarible/immutable-sdk"
import type { IApisSdk } from "../../domain"
import type { PrepareSellInternalResponse } from "../../types/order/sell/domain"
import type * as OrderCommon from "../../types/order/common"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { CancelOrderRequest, ICancel } from "../../types/order/cancel/domain"
import { calcBuyerBaseFee, getPreparedOrder, getTakeAssetType, unionPartsToParts } from "./common/utils"
import { getCurrencies } from "./common/currencies"

export class ImxOrderService {
	constructor(private sdk: RaribleImxSdk, private apis: IApisSdk) {
		this.sell = this.sell.bind(this)
		this.buy = this.buy.bind(this)
	}

	async sell(): Promise<PrepareSellInternalResponse> {
		const submit = Action.create({
			id: "send-tx" as const,
			run: async (request: OrderCommon.OrderInternalRequest) => {
				const [, contract, tokenId] = request.itemId.split(":")

				const res = await this.sdk.order.sell({
					amount: toBigNumber(request.price.toString()),
					originFees: unionPartsToParts(request.originFees),
					payouts: unionPartsToParts(request.payouts),
					makeAssetType: {
						assetClass: "ERC721",
						contract: toAddress(contract),
						tokenId: toBigNumber(tokenId),
					},
					takeAssetType: getTakeAssetType(request.currency),
				})

				return toOrderId("IMMUTABLEX:" + res.orderId)
			},
		})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportedCurrencies: getCurrencies(),
			baseFee: 200, // in reality is not taken from the seller, but it needs to display fees correctly
			supportsExpirationDate: false,
			submit: submit,
		}
	}

	async buy(prepare: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await getPreparedOrder(prepare, this.apis)

		if (order.status !== OrderStatus.ACTIVE) {
			throw new Error("Order is not active")
		}

		const getERC721Asset = () => {
			if (order.make.type["@type"] !== "ERC721") {
				throw new Error("Order make type should be ERC721")
			}

			const [, address] = order.make.type.contract.split(":")

			return {
				assetClass: "ERC721",
				contract: address,
				tokenId: order.make.type.tokenId,
			} as Erc721AssetRequest
		}

		const submit = Action
			.create({
				id: "send-tx" as const,
				run: async (request: FillRequest) => {
					const [, orderId] = order.id.split(":")
					const res = await this.sdk.order.buy({
						orderId: orderId,
						fee: unionPartsToParts(request.originFees),
					}, getERC721Asset())
					console.log(res)
					return res
				},
			})
			.after(res => new BlockchainImmutableXTransaction(res.txId))

		return {
			multiple: false,
			maxAmount: order.makeStock,
			baseFee: calcBuyerBaseFee(order),
			supportsPartialFill: false,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.NONE,
			submit,
		}
	}

	cancel: ICancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {

			const [, orderId] = request.orderId.split(":")

			await this.sdk.order.cancel({
				orderId: orderId,
			})

			return new BlockchainImmutableXTransaction(undefined)
		},
	})
}
