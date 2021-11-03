// eslint-disable-next-line camelcase
import { AssetType as TezosAssetType, get_address, Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { AssetType, Order, OrderId, OrderPayout } from "@rarible/api-client"
import { OrderForm, Part, Part as TezosPart } from "tezos-sdk-module/dist/order/utils"
// eslint-disable-next-line camelcase
import { fill_order } from "tezos-sdk-module/dist/order"
import { AssetType as TezosLibAssetType, Asset as TezosLibAsset } from "tezos-sdk-module/dist/common/base"
import { Address, BigNumber, Binary, toBigNumber, toOrderId, UnionAddress, Word } from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import { OrderRaribleV2DataV1 } from "@rarible/ethereum-api-client/build/models/OrderData"
import { OrderPriceHistoryRecord } from "@rarible/ethereum-api-client/build/models/OrderPriceHistoryRecord"
import { OrderExchangeHistory } from "@rarible/ethereum-api-client/build/models/OrderExchangeHistory"
import {
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
import { GetNftOwnershipByIdResponse } from "./domain"

export type SimpleTezosOrder = {
	type: "RARIBLE_V2";
	maker: Address;
	taker?: Address;
	makerEdpk: string,
	make: {
		assetType: TezosAsset,
		value: string
	},
	take: {
		assetType: TezosAsset,
		value: string
	},
	fill: BigNumber;
	start?: number;
	end?: number;
	makeStock: BigNumber;
	cancelled: boolean;
	salt: Word;
	signature?: Binary;
	createdAt: string;
	lastUpdateAt: string;
	pending?: Array<OrderExchangeHistory>;
	hash: Word;
	makeBalance?: BigNumber;
	makePriceUsd?: BigNumber;
	takePriceUsd?: BigNumber;
	priceHistory?: Array<OrderPriceHistoryRecord>;
	data: OrderRaribleV2DataV1;
}
export type TezosOrder = SimpleTezosOrder & { makerEdpk: string }
export type TezosOrderXTZAssetType = {
	assetClass: "XTZ"
}
export type TezosOrderFA12AssetType = {
	assetClass: "FA_1_2",
	contract: UnionAddress
}
export type TezosOrderFA2AssetType = {
	assetClass: "FA_2";
	contract: UnionAddress;
	tokenId: BigNumber;
}
export type TezosAsset = TezosOrderXTZAssetType | TezosOrderFA12AssetType | TezosOrderFA2AssetType
export type PreparedOrder = OrderForm & { makeStock: BigNumber }

export class Fill {
	constructor(
		private provider: Provider
	) {
		this.fill = this.fill.bind(this)
	}

	async getOrderByHash(orderId: OrderId): Promise<TezosOrder> {
		const response = await fetch(`${this.provider.api}/orders/${orderId}`)
		const json = await response.json()
		if ("code" in json && json.code === "INVALID_ARGUMENT") {
			throw new Error("Order does not exist")
		}
		return json
	}

	static getTezosAssetTypeFromCommonType(type: TezosAsset): TezosAssetType {
		switch (type.assetClass) {
			case "FA_2": {
				return {
					asset_class: type.assetClass,
					contract: type.contract,
					token_id: BigInt(type.tokenId),
				}
			}
			case "FA_1_2": {
				return {
					asset_class: type.assetClass,
					contract: type.contract,
				}
			}
			case "XTZ": {
				return {
					asset_class: type.assetClass,
				}
			}
			default: {
				throw Error("Invalid take asset type")
			}
		}
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

	assetTypeOfJson(a: any) : TezosLibAssetType {
		switch (a.assetClass) {
			case "FA_2":
				return {
					asset_class: a.assetClass,
					contract: a.contract,
					token_id: BigInt(a.tokenId),
				}
			case "XTZ":
				return { asset_class: a.assetClass }
			case "FA_1_2":
				return { asset_class: a.assetClass, contract: a.contract }
			default: throw new Error("Unknown Asset Class")
		}
	}

	assetOfJson(a: any): TezosLibAsset {
		const factor = 1000000.
		switch (a.assetType.assetClass) {
			case "FA_2":
				return {
					asset_type: this.assetTypeOfJson(a.assetType),
					value: BigInt(a.value),
				}
			default:
				return {
					asset_type: this.assetTypeOfJson(a.assetType),
					value: BigInt(a.value * factor),
				}
		}
	}

	async convertTezosOrderToForm(order: TezosOrder): Promise<PreparedOrder> {

		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.makerEdpk,
			make: this.assetOfJson(order.make),
			take: this.assetOfJson(order.take),
			salt: BigInt(order.salt),
			start: order.start,
			end: order.end,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: order.makeStock,
		}
	}

	convertOrderPayout(payout?: OrderPayout[] | Array<Part> | Array<{account: string, value: number}>): Array<TezosPart> {
		return payout?.map(p => ({
			account: p.account,
			value: BigInt(p.value),
		})) || []
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
		if ("order" in request) {
			return this.convertToFillOrder(request.order)
		} else if ("orderId" in request) {
			if (!request.orderId.startsWith("TEZOS")) {
				throw new Error("Wrong tezos orderId")
			}
			const order = await this.getOrderByHash(toOrderId(request.orderId.substring(6)))
			return this.convertTezosOrderToForm(order)
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
				const request = {
					amount: BigInt(fillRequest.amount),
					payouts: this.convertOrderPayout(fillRequest.payouts),
					origin_fees: this.convertOrderPayout(fillRequest.originFees),
					infinite: fillRequest.infiniteApproval,
					edpk: await this.provider.tezos.public_key(),
				}
				const fillResponse = await fill_order(
					this.provider,
					preparedOrder,
					request,
				)
				return new BlockchainTezosTransaction(fillResponse)
			},
		})

		return {
			multiple: false,
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(this.provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
