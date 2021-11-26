import type {
	AssetType as TezosAssetType, Provider,
	Asset as TezosLibAsset,
} from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import type { AssetType, Order } from "@rarible/api-client"
import type {
	OrderForm, Part, Part as TezosPart,
} from "tezos-sdk-module/dist/order"
// eslint-disable-next-line camelcase
import { fill_order, get_address } from "tezos-sdk-module"
import type {
	BigNumber as RaribleBigNumber,
} from "@rarible/types"
import {
	toBigNumber as toRaribleBigNumber,
	toBigNumber,
} from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type {
	Order as TezosOrder,
	Asset as TezosClientAsset,
} from "tezos-api-client"
import BigNumber from "bignumber.js"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { get_public_key } from "tezos-sdk-module/dist/common/base"
import { order_of_json } from "tezos-sdk-module/dist/order"
import type {
	FillRequest,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
import {
	OriginFeeSupport,
	PayoutsSupport,
} from "../../types/order/fill/domain"
import type { ITezosAPI, MaybeProvider, PreparedOrder } from "./common"
import { convertOrderToFillOrder, covertToLibAsset, isExistedTezosProvider } from "./common"


export class TezosFill {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.fill = this.fill.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	async convertTezosOrderToForm(order: TezosOrder): Promise<PreparedOrder> {
		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.makerEdpk,
			make: covertToLibAsset(order.make),
			take: covertToLibAsset(order.take),
			salt: order.salt,
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

	convertOrderPayout(payout?: Array<Part> | Array<{account: string, value: number}>): Array<TezosPart> {
		return payout?.map(p => ({
			account: p.account,
			value: new BigNumber(p.value),
		})) || []
	}

	// async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
	async getPreparedOrder(request: PrepareFillRequest): Promise<OrderForm> {
		if ("order" in request) {
			return convertOrderToFillOrder(request.order)
		} else if ("orderId" in request) {
			const [domain, hash] = request.orderId.split(":")
			if (domain !== "TEZOS") {
				throw new Error("Not an tezos order")
			}
			const order = await this.apis.order.getOrderByHash({
				hash,
			})
			// return this.convertTezosOrderToForm(order)
			return order_of_json(order)
		} else {
			throw new Error("Request error")
		}
	}

	async getMaxAmount(order: PreparedOrder): Promise<RaribleBigNumber> {
		const provider = this.getRequiredProvider()
		if (order.take.asset_type.asset_class === "MT" || order.take.asset_type.asset_class === "NFT") {
			// eslint-disable-next-line camelcase
			const { contract, token_id } = order.take.asset_type
			const ownershipId = `${contract}:${token_id.toString()}:${await get_address(provider)}`
			const response = await this.apis.ownership.getNftOwnershipById({
				ownershipId,
			})
			return toRaribleBigNumber(response.value)
		} else {
			return toRaribleBigNumber(order.makeStock)
		}
	}

	isMultiple(order: PreparedOrder): boolean {
		return order.take.asset_type.asset_class === "MT" || order.make.asset_type.asset_class === "MT"
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
					// edpk: await get_public_key(provider),
				}
				console.log("req", JSON.stringify(preparedOrder, null, "  "), JSON.stringify(request, null, " "))
				const fillResponse = await fill_order(
					provider,
					preparedOrder,
					request,
				)
				return new BlockchainTezosTransaction(fillResponse)
			},
		})

		return {
			// multiple: this.isMultiple(preparedOrder),
			multiple: true,
			// maxAmount: await this.getMaxAmount(preparedOrder),
			maxAmount: toBigNumber("1"),
			baseFee: parseInt(provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
