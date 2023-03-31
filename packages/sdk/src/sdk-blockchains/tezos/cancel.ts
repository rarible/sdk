import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { cancel, versum_cancel_swap, hen_cancel_swap, teia_cancel_swap, objkt_retract_ask_v1,
// eslint-disable-next-line camelcase
	objkt_retract_ask_v2, fxhash_v1_cancel_offer, fxhash_v2_cancel_listing,
} from "@rarible/tezos-sdk/dist/main"
import type { TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import BigNumber from "bignumber.js"
import type { CancelV2OrderRequest } from "@rarible/tezos-sdk/dist/sales/cancel"
import { cancelV2 } from "@rarible/tezos-sdk/dist/sales/cancel"
import type { Order, TezosMTAssetType, TezosNFTAssetType } from "@rarible/api-client"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
// eslint-disable-next-line camelcase
import { cancel_bid } from "@rarible/tezos-sdk/dist/bids"
import type { CancelBid } from "@rarible/tezos-sdk/bids/index"
import type { CancelOrderRequest, ICancelAction } from "../../types/order/cancel/domain"
import type { IApisSdk } from "../../domain"
import type { MaybeProvider } from "./common"
import {
	checkChainId,
	convertFromContractAddress,
	getRequiredProvider,
	getTezosAssetTypeV2,
	getTezosOrderLegacyForm,
	isMTAssetType,
	isNftAssetType,
} from "./common"

export class TezosCancel {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private unionAPI: IApisSdk,
		private network: TezosNetwork,
	) {
		this.cancelBasic = this.cancelBasic.bind(this)
	}

	cancel: ICancelAction = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelOrderRequest) => {
			await checkChainId(this.provider)

			const order = await this.unionAPI.order.getOrderById({ id: request.orderId })
			if (!order) {
				throw new Error("Order has not been found")
			}
			const provider = getRequiredProvider(this.provider)

			const makeIsNft = isNftAssetType(order.make.type) || isMTAssetType(order.make.type)

			if (order.data["@type"] === "TEZOS_RARIBLE_V3") {
			  if (makeIsNft) {
					return this.cancelV2SellOrder(order)
				}
				if (isNftAssetType(order.take.type) || isMTAssetType(order.take.type)) {
					const asset = await getTezosAssetTypeV2(provider.config, order.make.type)
					const bidData: CancelBid = {
						asset_contract: convertFromContractAddress(order.take.type.contract),
						asset_token_id: new BigNumber(order.take.type.tokenId),
						bid_type: asset.type,
						bid_asset_contract: asset.asset_contract,
						bid_asset_token_id: asset.asset_token_id,
					}
					const tx = await cancel_bid(provider, bidData)
					return new BlockchainTezosTransaction(tx, this.network)
				}
			}

			if (makeIsNft) {
				if (order.data["@type"] === "TEZOS_HEN") {
					const op = await hen_cancel_swap(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_VERSUM_V1") {
					const op = await versum_cancel_swap(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_TEIA_V1") {
					const op = await teia_cancel_swap(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_OBJKT_V1") {
					const op = await objkt_retract_ask_v1(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_OBJKT_V2") {
					const op = await objkt_retract_ask_v2(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_FXHASH_V1") {
					const op = await fxhash_v1_cancel_offer(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}

				if (order.data["@type"] === "TEZOS_FXHASH_V2") {
					const op = await fxhash_v2_cancel_listing(provider, request.orderId)
					if (!op) {
						throw new Error("Operation is undefined")
					}
					return new BlockchainTezosTransaction(op, this.network)
				}
			}

			const orderForm = getTezosOrderLegacyForm(order)
			const tx = await cancel(
				getRequiredProvider(this.provider),
				orderForm as OrderForm
			)

			return new BlockchainTezosTransaction(tx, this.network)
		},
	})

	async cancelV2SellOrder(order: Order): Promise<IBlockchainTransaction> {
		await checkChainId(this.provider)

		const provider = getRequiredProvider(this.provider)
		const currency = await getTezosAssetTypeV2(this.provider.config, order.take.type)
		const cancelRequest: CancelV2OrderRequest = {
			asset_contract: convertFromContractAddress((order.make.type as TezosNFTAssetType | TezosMTAssetType).contract),
			asset_token_id: new BigNumber((order.make.type as TezosNFTAssetType | TezosMTAssetType).tokenId),
			sale_asset_contract: currency.asset_contract,
			sale_asset_token_id: currency.asset_token_id,
			sale_type: currency.type,
		}
		const canceledOrder = await cancelV2(provider, cancelRequest)
		if (!canceledOrder) {
			throw new Error("Cancel transaction has not been returned")
		}
		return new BlockchainTezosTransaction(canceledOrder, this.network)
	}

	async cancelBasic(request: CancelOrderRequest): Promise<IBlockchainTransaction> {
		return this.cancel(request)
	}
}
