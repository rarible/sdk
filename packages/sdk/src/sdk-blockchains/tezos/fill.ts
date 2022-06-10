import { Action } from "@rarible/action"
import type { Part } from "@rarible/tezos-common"
import type { OrderDataTypeRequest, TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { OrderType, AssetTypeV2, fill_order, get_address, get_active_order_type } from "@rarible/tezos-sdk"
import type { BigNumber as RaribleBigNumber } from "@rarible/types"
import { toBigNumber as toRaribleBigNumber, toBigNumber } from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { Order as TezosOrder } from "tezos-api-client"
import BigNumber from "bignumber.js"
import type { Order } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { BuyRequest } from "@rarible/tezos-sdk/dist/sales/buy"
import { buyV2, isExistsSaleOrder } from "@rarible/tezos-sdk/dist/sales/buy"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { UnionPart } from "../../types/order/common"
import type { IApisSdk } from "../../domain"
import type { ITezosAPI, MaybeProvider, PreparedOrder } from "./common"
import {
	convertFromContractAddress,
	convertOrderToFillOrder, convertTezosOrderId,
	covertToLibAsset,
	getRequiredProvider,
	getTezosAddress, getTezosAssetTypeV2,
	getTokenIdString,
} from "./common"

export class TezosFill {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private unionAPI: IApisSdk,
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

	convertOrderPayout(payout?: Array<Part> | Array<{account: string, value: number}>): Array<Part> {
		return payout?.map(p => ({
			account: p.account,
			value: new BigNumber(p.value),
		})) || []
	}

	async getPreparedOrderLegacy(request: PrepareFillRequest): Promise<PreparedOrder> {
		if ("order" in request) {
			return convertOrderToFillOrder(request.order)
		} else if ("orderId" in request) {
			const [domain, hash] = request.orderId.split(":")
			if (domain !== Blockchain.TEZOS) {
				throw new Error("Not an tezos order")
			}
			console.log("hash", hash)
			const order = await this.apis.order.getOrderByHash({
				hash,
			})
			return this.convertTezosOrderToForm(order)
		} else {
			throw new Error("Request error")
		}
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		} else if ("orderId" in request) {
			const [domain, hash] = request.orderId.split(":")
			if (domain !== Blockchain.TEZOS) {
				throw new Error("Not an tezos order")
			}
			console.log("hash", hash)
			return this.unionAPI.order.getOrderById({
				id: request.orderId,
			})
		} else {
			throw new Error("Request error")
		}
	}

	async getMaxAmount(order: Order): Promise<RaribleBigNumber> {
		const provider = getRequiredProvider(this.provider)
		if (order.take.type["@type"] === "TEZOS_MT" || order.take.type["@type"] === "TEZOS_NFT") {
			const { contract, tokenId } = order.take.type
			const ownershipId = `${contract}:${tokenId.toString()}:${await get_address(provider)}`
			const response = await this.apis.ownership.getNftOwnershipById({
				ownershipId,
			})
			return toRaribleBigNumber(response.value)
		} else {
			return toRaribleBigNumber(order.makeStock)
		}
	}

	isMultiple(order: Order): boolean {
		return order.take.type["@type"] === "TEZOS_MT" || order.make.type["@type"] === "TEZOS_MT"
	}

	private async buyV2(order: Order, data: OrderDataTypeRequest, fillRequest: FillRequest) {
		const provider = getRequiredProvider(this.provider)
		const amount = (order.take.value !== undefined) ? new BigNumber(order.take.value) : new BigNumber(0)
		const currency = await getTezosAssetTypeV2(this.provider.config, order.take.type)
		const buyRequest: BuyRequest = {
			asset_contract: data.contract,
			asset_token_id: new BigNumber(data.token_id),
			asset_seller: data.seller,
			sale_type: currency.type,
			sale_asset_contract: currency.asset_contract,
			sale_asset_token_id: currency.asset_token_id,
			sale_amount: amount,
			sale_qty: new BigNumber(fillRequest.amount),
			sale_payouts: convertUnionParts(fillRequest.payouts),
			sale_origin_fees: convertUnionParts(fillRequest.originFees),
			use_all: false,
		}
		console.log("buyRequest", buyRequest)
		const isOrderExists = await isExistsSaleOrder(provider, buyRequest)
		if (isOrderExists) {
			console.log("before buy", JSON.stringify(buyRequest, null, "  "))
			const op = await buyV2(provider, buyRequest)
			return new BlockchainTezosTransaction(op, this.network)
		} else {
			throw new Error("Error order does not exist")
		}

	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const { make, take } = preparedOrder
				if (make.type["@type"] === "TEZOS_NFT" || make.type["@type"] === "TEZOS_MT") {
					const request: OrderDataTypeRequest = {
						contract: convertFromContractAddress(make.type.contract),
						token_id: new BigNumber(make.type.tokenId),
						seller: getTezosAddress(preparedOrder.maker),
						buy_asset_contract: "contract" in take.type ? convertFromContractAddress(take.type.contract) : undefined,
						buy_asset_token_id: take.type["@type"] === "TEZOS_FT" ? getTokenIdString(take.type.tokenId) : undefined,
					}
					const type = await get_active_order_type(this.provider.config, request)
					if (type === OrderType.V2) {
						return this.buyV2(preparedOrder, request, fillRequest)
					}
				}
				return this.fillV1Order(fillRequest, preparedOrder)
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

	private async fillV1Order(fillRequest: FillRequest, order: Order) {
		const provider = getRequiredProvider(this.provider)
		const request = {
			amount: new BigNumber(fillRequest.amount),
			payouts: convertUnionParts(fillRequest.payouts),
			origin_fees: convertUnionParts(fillRequest.originFees),
			infinite: fillRequest.infiniteApproval,
			use_all: true,
		}
		const preparedOrder = convertOrderToFillOrder(order)
		const fillResponse = await fill_order(
			provider,
			preparedOrder,
			request,
			fillRequest.unwrap
		)
		return new BlockchainTezosTransaction(fillResponse, this.network)
	}
}

function convertUnionParts(parts?: UnionPart[]): Part[] {
	return parts?.map(p => ({
		account: getTezosAddress(p.account),
		value: new BigNumber(p.value),
	})) || []
}
