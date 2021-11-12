import type { AssetType as TezosAssetType, Provider } from "tezos-sdk-module/dist/common/base"
import type { Maybe } from "@rarible/types/build/maybe"
// eslint-disable-next-line camelcase
import { get_address } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import type { AssetType, Order, OrderId, OrderPayout } from "@rarible/api-client"
import type { OrderForm, Part, Part as TezosPart } from "tezos-sdk-module/dist/order/utils"
// eslint-disable-next-line camelcase
import { fill_order } from "tezos-sdk-module/dist/order"
import type { AssetType as TezosLibAssetType, Asset as TezosLibAsset } from "tezos-sdk-module/dist/common/base"
import type {
	BigNumber as RaribleBigNumber } from "@rarible/types"
import {
	toBigNumber as toRaribleBigNumber,
	toOrderId,
	toBigNumber,
} from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type {
	Order as TezosOrder,
	// AssetType as TezosAssetType
	AssetType as TezosClientAssetType,
} from "tezos-api-client"
import BigNumber from "bignumber.js"
import type {
	FillRequest,
	PrepareFillRequest,
	PrepareFillResponse } from "../../types/order/fill/domain"
import {
	OriginFeeSupport,
	PayoutsSupport,
} from "../../types/order/fill/domain"
import type { GetNftOwnershipByIdResponse } from "./domain"

export type PreparedOrder = OrderForm & { makeStock: RaribleBigNumber }

export class TezosFill {
	constructor(private provider: Maybe<Provider>) {
		this.fill = this.fill.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!this.provider) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async getOrderByHash(orderId: OrderId): Promise<TezosOrder> {
		const provider = this.getRequiredProvider()
		const response = await fetch(`${provider.api}/orders/${orderId}`)
		const json = await response.json()
		if ("code" in json && json.code === "INVALID_ARGUMENT") {
			throw new Error("Order does not exist")
		}
		return json
	}

	static getTezosAssetTypeFromCommonType(type: TezosClientAssetType): TezosAssetType {
		switch (type.assetClass) {
			case "FA_2":
				return {
					asset_class: type.assetClass,
					contract: type.contract,
					"token_id": new BigNumber(type.tokenId),
				}
			case "FA_1_2":
				return {
					asset_class: type.assetClass,
					contract: type.contract,
				}
			case "XTZ":
				return {
					asset_class: type.assetClass,
				}
			default:
				throw new Error("Invalid take asset type")
		}
	}

 	static getTezosAssetType(type: AssetType): TezosAssetType {
		switch (type["@type"]) {
			case "FA_2": {
				return {
					asset_class: type["@type"],
					contract: type.contract,
					"token_id": new BigNumber(type.tokenId),
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
				throw new Error("Invalid take asset type")
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
				asset_type: TezosFill.getTezosAssetType(order.make.type),
				value: new BigNumber(order.make.value),
			},
			take: {
				asset_type: TezosFill.getTezosAssetType(order.make.type),
				value: new BigNumber(order.make.value),
			},
			salt: new BigNumber(order.salt),
			start: order.startedAt ? parseInt(order.startedAt) : undefined,
			end: order.endedAt ? parseInt(order.endedAt) : undefined,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: toRaribleBigNumber(order.makeStock),
		}
	}

	assetTypeOfJson(a: any) : TezosLibAssetType {
		switch (a.assetClass) {
			case "FA_2":
				return {
					asset_class: a.assetClass,
					contract: a.contract,
					token_id: new BigNumber(a.tokenId),
				}
			case "XTZ":
				return { asset_class: a.assetClass }
			case "FA_1_2":
				return { asset_class: a.assetClass, contract: a.contract }
			default: throw new Error("Unknown Asset Class")
		}
	}

	assetOfJson(a: any): TezosLibAsset {
		const factor = 1000000
		switch (a.assetType.assetClass) {
			case "FA_2":
				return {
					asset_type: this.assetTypeOfJson(a.assetType),
					value: new BigNumber(a.value),
				}
			default:
				return {
					asset_type: this.assetTypeOfJson(a.assetType),
					value: new BigNumber(a.value).multipliedBy(factor),
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
			salt: new BigNumber(order.salt),
			start: order.start,
			end: order.end,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: toBigNumber(order.makeStock),
		}
	}

	convertOrderPayout(payout?: OrderPayout[] | Array<Part> | Array<{account: string, value: number}>): Array<TezosPart> {
		return payout?.map(p => ({
			account: p.account,
			value: new BigNumber(p.value),
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
		const provider = this.getRequiredProvider()
		const response = await fetch(`${provider.api}/ownerships/${ownershipId}`)
		return await response.json()
	}

	async getMaxAmount(order: PreparedOrder): Promise<RaribleBigNumber> {
		const provider = this.getRequiredProvider()
		if (order.take.asset_type.asset_class === "FA_2") {
			const response = await this.getOwnershipId(
				order.take.asset_type.contract,
				order.take.asset_type.token_id.toString(),
				await get_address(provider)
			)
			return toRaribleBigNumber(response.value)
		} else {
			return toRaribleBigNumber(order.makeStock)
		}
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const provider = this.getRequiredProvider()
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const request = {
					amount: new BigNumber(fillRequest.amount),
					payouts: this.convertOrderPayout(fillRequest.payouts),
					origin_fees: this.convertOrderPayout(fillRequest.originFees),
					infinite: fillRequest.infiniteApproval,
					edpk: await provider.tezos.public_key(),
				}
				const fillResponse = await fill_order(
					provider,
					preparedOrder,
					request,
				)
				return new BlockchainTezosTransaction(fillResponse)
			},
		})

		return {
			multiple: false,
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
