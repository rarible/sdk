import { Action } from "@rarible/action"
import type {
	TezosNetwork,
	TezosProvider,
	CartOrder,
} from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { fill_order, get_address, cart_purchase, fxhash_v1_collect,
// eslint-disable-next-line camelcase
	versum_collect, teia_collect, objkt_fulfill_ask_v2, objkt_fulfill_ask_v1,
	// eslint-disable-next-line camelcase
	fxhash_v2_listing_accept, hen_collect,
} from "@rarible/tezos-sdk"
import type { BigNumber as RaribleBigNumber } from "@rarible/types"
import { toBigNumber as toRaribleBigNumber } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { Order } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { BuyRequest } from "@rarible/tezos-sdk/dist/sales/buy"
import { buyV2, isExistsSaleOrder } from "@rarible/tezos-sdk/dist/sales/buy"
// eslint-disable-next-line camelcase
import { accept_bid } from "@rarible/tezos-sdk/dist/bids"
import type { AcceptBid } from "@rarible/tezos-sdk/dist/bids"
import { Warning } from "@rarible/logger/build"
import { toBn } from "@rarible/utils/build/bn"
import type {
	FillRequest,
	PrepareFillRequest,
	PrepareFillResponse,
	IBatchBuyTransactionResult,
} from "../../types/order/fill/domain"
import {
	MaxFeesBasePointSupport,
	OriginFeeSupport,
	PayoutsSupport,
} from "../../types/order/fill/domain"
import type {
	BatchFillRequest,
	PrepareBatchBuyResponse,
} from "../../types/order/fill/domain"
import type { IApisSdk } from "../../domain"
import type { AcceptBidSimplifiedRequest, BuySimplifiedRequest } from "../../types/order/fill/simplified"
import { checkPayouts } from "../../common/check-payouts"
import type { MaybeProvider, OrderDataRequest } from "./common"
import {
	checkChainId,
	convertFromContractAddress, convertUnionAddress,
	convertUnionParts, getPayouts,
	getRequiredProvider,
	getTezosAddress,
	getTezosAssetTypeV2,
	getTezosOrderId, getTezosOrderLegacyForm, isNftOrMTAssetType,
} from "./common"


export class TezosFill {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.fill = this.fill.bind(this)
		this.batchBuy = this.batchBuy.bind(this)
		this.batchBuyBasic = this.batchBuyBasic.bind(this)
		this.buyBasic = this.buyBasic.bind(this)
		this.acceptBid = this.acceptBid.bind(this)
		this.acceptBidBasic = this.acceptBidBasic.bind(this)
		this.fillCommon = this.fillCommon.bind(this)
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<Order> {
		if ("order" in request) {
			return request.order
		} else if ("orderId" in request) {
			const [domain] = request.orderId.split(":")
			if (domain !== Blockchain.TEZOS) {
				throw new Error("Not an tezos order")
			}
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
			const response = await this.unionAPI.ownership.getOwnershipById({
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

	private async buyV2(order: Order, data: OrderDataRequest, fillRequest: FillRequest) {
		await checkChainId(this.provider)
		checkPayouts(fillRequest.payouts)
		const provider = getRequiredProvider(this.provider)
		const amount = (order.makePrice !== undefined) ? new BigNumber(order.makePrice) : new BigNumber(0)
		const currency = await getTezosAssetTypeV2(this.provider.config, order.take.type)
		if (!data.make_contract || !data.make_token_id) {
			throw new Error("Make data for buyV2 should exist")
		}
		const buyRequest: BuyRequest = {
			asset_contract: data.make_contract,
			asset_token_id: new BigNumber(data.make_token_id),
			asset_seller: getTezosAddress(order.maker),
			sale_type: currency.type,
			sale_asset_contract: currency.asset_contract,
			sale_asset_token_id: currency.asset_token_id,
			sale_amount: amount,
			sale_qty: new BigNumber(fillRequest.amount),
			sale_payouts: convertUnionParts(fillRequest.payouts),
			sale_origin_fees: convertUnionParts(fillRequest.originFees),
			use_all: false,
		}
		const isOrderExists = await isExistsSaleOrder(provider, buyRequest)
		if (isOrderExists) {
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
				return this.fillCommon(fillRequest, preparedOrder)
			},
		})

		return {
			multiple: this.isMultiple(preparedOrder),
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(this.provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportsPartialFill: true,
			submit,
			orderData: {
				platform: preparedOrder.platform,
			},
		}
	}

	private async fillV1Order(fillRequest: FillRequest, order: Order) {
		await checkChainId(this.provider)

		const provider = getRequiredProvider(this.provider)
		const request = {
			amount: new BigNumber(fillRequest.amount),
			payouts: convertUnionParts(fillRequest.payouts),
			origin_fees: convertUnionParts(fillRequest.originFees),
			infinite: fillRequest.infiniteApproval,
			use_all: true,
		}

		const preparedOrder = getTezosOrderLegacyForm(order)
		const fillResponse = await fill_order(
			provider,
			preparedOrder,
			request,
			//fillRequest.unwrap
		)
		return new BlockchainTezosTransaction(fillResponse, this.network)
	}

	async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
		let preparedOrder = await this.getPreparedOrder(request)
		return this.fillCommon(request, preparedOrder)
	}

	async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
		const response = await this.acceptBid(request)
		return response.submit(request)
	}

	async acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		let preparedOrder = await this.getPreparedOrder(request)

		const { make, take, data } = preparedOrder
		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				await checkChainId(this.provider)
				checkPayouts(fillRequest.payouts)
				const provider = getRequiredProvider(this.provider)

				if (!isNftOrMTAssetType(take.type)) {
					throw new Warning("Non-bid order has been passed")
				}
				if (data["@type"] !== "TEZOS_RARIBLE_V3") {
					throw new Error("It's not TEZOS_RARIBLE_V3 order")
				}
				if (!(toBn(fillRequest.amount).isEqualTo(take.value))) {
					throw new Warning("Partial fill is unavailable for tezos orders")
				}
				const asset = await getTezosAssetTypeV2(provider.config, make.type)

				const acceptBidRequest: AcceptBid = {
					asset_contract: convertFromContractAddress(take.type.contract),
					asset_token_id: new BigNumber(take.type.tokenId),
					bidder: convertUnionAddress(preparedOrder.maker),
					bid_type: asset.type,
					bid_asset_contract: asset.asset_contract,
					bid_asset_token_id: asset.asset_token_id,
					bid_origin_fees: convertUnionParts(data.originFees),
					bid_payouts: await getPayouts(provider, data.payouts),
				}
				const tx = await accept_bid(provider, acceptBidRequest)
				return new BlockchainTezosTransaction(tx, this.network)
			},
		})

		return {
			multiple: this.isMultiple(preparedOrder),
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(this.provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
			supportsPartialFill: false,
			submit,
			orderData: {
				platform: preparedOrder.platform,
			},
		}
	}

	async fillCommon(fillRequest: FillRequest, preparedOrder: Order) {
		await checkChainId(this.provider)
		checkPayouts(fillRequest.payouts)

		const provider = getRequiredProvider(this.provider)
		const { make, take } = preparedOrder
		if (isNftOrMTAssetType(make.type)) {
			const request: OrderDataRequest = {
				make_contract: convertFromContractAddress(make.type.contract),
				make_token_id: new BigNumber(make.type.tokenId),
				maker: getTezosAddress(preparedOrder.maker),
				take_contract: "contract" in take.type ? convertFromContractAddress(take.type.contract) : undefined,
			}
			if (take.type["@type"] === "TEZOS_FT" && take.type.tokenId) {
				request.take_token_id = new BigNumber(take.type.tokenId.toString())
			}
			if (preparedOrder.data["@type"] === "TEZOS_RARIBLE_V3") {
				return this.buyV2(preparedOrder, request, fillRequest)
			}

			if (preparedOrder.data["@type"] === "TEZOS_HEN") {
				const op = await hen_collect(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_HEN operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_VERSUM_V1") {
				const op = await versum_collect(provider, preparedOrder.id, new BigNumber(fillRequest.amount))
				if (!op) {
					throw new Error("TEZOS_VERSUM_V1 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_TEIA_V1") {
				const op = await teia_collect(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_TEIA_V1 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_OBJKT_V1") {
				const op = await objkt_fulfill_ask_v1(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_OBJKT_V1 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_OBJKT_V2") {
				const op = await objkt_fulfill_ask_v2(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_OBJKT_V2 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_FXHASH_V1") {
				const op = await fxhash_v1_collect(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_FXHASH_V1 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

			if (preparedOrder.data["@type"] === "TEZOS_FXHASH_V2") {
				const op = await fxhash_v2_listing_accept(provider, preparedOrder.id)
				if (!op) {
					throw new Error("TEZOS_FXHASH_V2 operation result is empty")
				}
				return new BlockchainTezosTransaction(op, this.network)
			}

		}
		return this.fillV1Order(fillRequest, preparedOrder)
	}

	async batchBuyCommon(
		fillRequest: BatchFillRequest
	): Promise<IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>> {
		await checkChainId(this.provider)
		const provider = getRequiredProvider(this.provider)

		const orders: CartOrder[] = fillRequest.map((req) => {
			checkPayouts(req.payouts)
			return {
				order_id: getTezosOrderId(req.orderId),
				amount: new BigNumber(req.amount),
				payouts: convertUnionParts(req.payouts),
				origin_fees: convertUnionParts(req.originFees),
			}
		})

		const fillResponse = await cart_purchase(provider, orders)
		return new BlockchainTezosTransaction(fillResponse, this.network)
	}

	async batchBuyBasic(
		request: BatchFillRequest
	): Promise<IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>> {
		return this.batchBuyCommon(request)
	}

	async batchBuy(prepareRequest: PrepareFillRequest[]): Promise<PrepareBatchBuyResponse> {
		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: BatchFillRequest) => {
				return this.batchBuyCommon(fillRequest)
			},
		})

		const prepared = await Promise.all(
			prepareRequest.map(async (req) => {
				let preparedOrder = await this.getPreparedOrder(req)

				return {
					orderId: preparedOrder.id,
					multiple: this.isMultiple(preparedOrder),
					maxAmount: await this.getMaxAmount(preparedOrder),
					baseFee: parseInt(this.provider.config.fees.toString()),
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.MULTIPLE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill: true,
					orderData: {
						platform: preparedOrder.platform,
					},
				}
			}))

		return {
			submit,
			prepared,
		}
	}
}
