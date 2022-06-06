import { Action } from "@rarible/action"
import type { Part } from "@rarible/tezos-common"
import type { OrderDataTypeRequest, TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { OrderType, AssetTypeV2, fill_order, get_active_order_type, get_address } from "@rarible/tezos-sdk"
import type { BigNumber as RaribleBigNumber } from "@rarible/types"
import { toBigNumber as toRaribleBigNumber, toBigNumber } from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { Order as TezosOrder } from "tezos-api-client"
import BigNumber from "bignumber.js"
import { Blockchain } from "@rarible/api-client"
import type { BuyRequest } from "@rarible/tezos-sdk/dist/sales/buy"
import { buyV2, isExistsSaleOrder } from "@rarible/tezos-sdk/dist/sales/buy"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { UnionPart } from "../../types/order/common"
import type { IApisSdk } from "../../domain"
import type { ITezosAPI, MaybeProvider, PreparedOrder } from "./common"
import {
	convertOrderToFillOrder,
	covertToLibAsset,
	getRequiredProvider,
	getTezosAddress,
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

	async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
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

	private async buyV2(order: PreparedOrder, data: OrderDataTypeRequest) {
		const provider = getRequiredProvider(this.provider)
		try {
			const ftTokenId = new BigNumber(data.buy_asset_token_id || 0)
			const amount = (order.make.value !== undefined) ? new BigNumber(order.make.value) : new BigNumber(0)
			const buyRequest: BuyRequest = {
				asset_contract: data.contract,
				asset_token_id: new BigNumber(data.token_id),
				asset_seller: data.seller,
				// sale_type: argv.sale_type,
				//todo
				sale_type: AssetTypeV2.XTZ,
				sale_asset_contract: data.buy_asset_contract,
				sale_asset_token_id: ftTokenId,
				sale_amount: amount,
				sale_qty: new BigNumber(order.make.value),
				sale_payouts: [],
				sale_origin_fees: [],
				use_all: false,
			}
			const isOrderExists = await isExistsSaleOrder(provider, buyRequest)
			if (isOrderExists) {
				const op = await buyV2(provider, buyRequest)
				return op
			} else {
				throw new Error("Error order does not exist")
			}
		} catch (e) {
			try {
				console.error(JSON.stringify(e, null, " "))
			} catch (e) {
				console.error(e)
			}
		}
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const provider = getRequiredProvider(this.provider)

				const { make, take } = preparedOrder
				if (make.asset_type.asset_class === "NFT" || make.asset_type.asset_class === "MT") {
					const request: OrderDataTypeRequest = {
						contract: make.asset_type.contract,
						token_id: new BigNumber(make.asset_type.token_id),
						seller: preparedOrder.maker,
						buy_asset_contract: "contract" in take.asset_type ? take.asset_type.contract : undefined,
						buy_asset_token_id: take.asset_type.asset_class === "FT" ? getTokenIdString(take.asset_type.token_id) : undefined,
					}
					const type = await get_active_order_type(this.provider.config, request)

					if (type === OrderType.V2) {
						console.log("preparedOrder", preparedOrder)
					}
				}

				const request = {
					amount: new BigNumber(fillRequest.amount),
					payouts: convertUnionParts(fillRequest.payouts),
					origin_fees: convertUnionParts(fillRequest.originFees),
					infinite: fillRequest.infiniteApproval,
					use_all: true,
				}
				const fillResponse = await fill_order(
					provider,
					preparedOrder,
					request,
					fillRequest.unwrap
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

function convertUnionParts(parts?: UnionPart[]): Part[] {
	return parts?.map(p => ({
		account: getTezosAddress(p.account),
		value: new BigNumber(p.value),
	})) || []
}
