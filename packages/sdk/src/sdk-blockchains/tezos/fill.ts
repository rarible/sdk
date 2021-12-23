import { Action } from "@rarible/action"
import type {
	Part, Part as TezosPart,
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
} from "tezos-api-client"
import BigNumber from "bignumber.js"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { TezosNetwork } from "tezos-sdk-module/dist/common/base"
import { Blockchain } from "@rarible/api-client"
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
import { convertOrderToFillOrder, covertToLibAsset, getRequiredProvider } from "./common"

export class TezosFill {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private network: TezosNetwork,
	) {
		this.fill = this.fill.bind(this)
	}

	async convertTezosOrderToForm(order: TezosOrder): Promise<PreparedOrder> {
		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.makerEdpk,
			taker_edpk: order.takerEdpk,
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

	async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
		if ("order" in request) {
			return convertOrderToFillOrder(request.order)
		} else if ("orderId" in request) {
			const [domain, hash] = request.orderId.split(":")
			if (domain !== Blockchain.TEZOS) {
				throw new Error("Not an tezos order")
			}
			const order = await this.apis.order.getOrderByHash({
				hash,
			})
			return this.convertTezosOrderToForm(order)
		} else {
			throw new Error("Request error")
		}
	}

	async getMaxAmount(order: PreparedOrder): Promise<RaribleBigNumber> {
		const provider = getRequiredProvider(this.provider)
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
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const provider = getRequiredProvider(this.provider)
				const request = {
					amount: new BigNumber(fillRequest.amount),
					payouts: this.convertOrderPayout(fillRequest.payouts),
					origin_fees: this.convertOrderPayout(fillRequest.originFees),
					infinite: fillRequest.infiniteApproval,
				}
				const fillResponse = await fill_order(
					provider,
					preparedOrder,
					request,
				)
				return new BlockchainTezosTransaction(fillResponse, this.network)
			},
		})

		return {
			multiple: this.isMultiple(preparedOrder),
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(this.provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
