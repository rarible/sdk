// eslint-disable-next-line camelcase
import { AssetType as TezosAssetType, get_address, Provider } from "tezos/sdk/common/base"
import { Action } from "@rarible/action"
import { AssetType, Order, OrderId, OrderPayout } from "@rarible/api-client"
import { OrderForm, Part as TezosPart } from "tezos/sdk/order/utils"
// eslint-disable-next-line camelcase
import { fill_order } from "tezos/sdk/order"
import { BigNumber, toBigNumber } from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction/src"
import {
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../order/fill/domain"
import { GetNftOwnershipByIdResponse } from "./domain"

export type PreparedOrder = OrderForm & { makeStock: BigNumber }

export class Fill {
	constructor(
		private provider: Provider
	) {
		this.fill = this.fill.bind(this)
	}

	async getOrderByHash(orderId: OrderId) {
		const response = await fetch(`${this.provider.api}/orders/${orderId}`)
		return await response.json()
	}

	static getTezosAssetType(type: AssetType): TezosAssetType {
		switch (type["@type"]) {
			case "FA_2": {
				return {
					asset_class: type["@type"],
					contract: type.contract,
					token_id: BigInt(type.tokenId),
				}
			}
			case "FA_1_2": {
				return {
					asset_class: type["@type"],
					contract: type.contract,
				}
			}
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			default: {
				throw Error("Invalid take asset type")
			}
		}
	}

	convertToFillOrder(order: Order): PreparedOrder {
		if (order.data["@type"] !== "TEZOS_RARIBLE_V2") {
			throw new Error("Unsupported order data type")
		}

		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.data.makerEdpk!,
			taker: order.taker,
			taker_edpk: order.data.takerEdpk,
			make: {
				asset_type: Fill.getTezosAssetType(order.make.type),
				value: BigInt(order.make.value),
			},
			take: {
				asset_type: Fill.getTezosAssetType(order.make.type),
				value: BigInt(order.make.value),
			},
			salt: BigInt(order.salt),
			start: order.startedAt ? parseInt(order.startedAt) : undefined,
			end: order.endedAt ? parseInt(order.endedAt) : undefined,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: order.makeStock,
		}
	}

	convertOrderPayout(payout?: OrderPayout[]): Array<TezosPart> {
		return payout?.map(p => ({
			account: p.account,
			value: BigInt(p.value),
		})) || []
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
		if ("order" in request) {
			return this.convertToFillOrder(request.order)
		} else if ("orderId" in request) {
			return this.getOrderByHash(request.orderId)
		} else {
			throw new Error("Request error")
		}
	}

	async getOwnershipId(contract: string, tokenId: string, owner: string): Promise<GetNftOwnershipByIdResponse> {
		const ownershipId = `${contract}:${tokenId}:${owner}`
		const response = await fetch(`${this.provider.api}/ownerships/${ownershipId}`)
		return await response.json()
	}

	async getMaxAmount(order: PreparedOrder): Promise<BigNumber> {
		if (order.take.asset_type.asset_class === "FA_2") {
			const response = await this.getOwnershipId(
				order.take.asset_type.contract,
				order.take.asset_type.token_id.toString(),
				await get_address(this.provider)
			)
			return toBigNumber(response.value)
		} else {
			return toBigNumber(order.makeStock)
		}
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const fillResponse = await fill_order(
					this.provider,
					preparedOrder,
					{
						amount: BigInt(fillRequest.amount),
						payouts: this.convertOrderPayout(fillRequest.payouts),
						origin_fees: this.convertOrderPayout(fillRequest.originFees),
						infinite: fillRequest.infiniteApproval,
					})

				return new BlockchainTezosTransaction(fillResponse)
			},
		})

		return {
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(this.provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
