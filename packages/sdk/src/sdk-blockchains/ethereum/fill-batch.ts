import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import { toAddress, toOrderId, toWord } from "@rarible/types"
import type {
	FillBatchOrderAction,
	FillBatchSingleOrderRequest,
	FillOrderRequest,
} from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { isNft } from "@rarible/protocol-ethereum-sdk/build/order/is-nft"
import type {
	CommonFillBatchResponse,
	FillBatchRequest,
	FillRequest,
	PrepareFillBatchResponse,
	PrepareFillRequest,
} from "../../types/order/fill/domain"
import { EthereumFill } from "./fill"
import { convertToEthereumAddress, getEthereumItemId } from "./common"

export type SimplePreparedOrder = SimpleOrder & { makeStock: BigNumber }

export class EthereumFillBatch {
	filler: EthereumFill

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.buyBatch = this.buyBatch.bind(this)
		this.filler = new EthereumFill(sdk, wallet, network)
	}

	private getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillBatchSingleOrderRequest {
		let request: FillOrderRequest
		switch (order.type) {
			case "RARIBLE_V2": {
				request = {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					payouts: fillRequest.payouts?.map(payout => ({
						account: convertToEthereumAddress(payout.account),
						value: payout.value,
					})),
					originFees: fillRequest.originFees?.map(fee => ({
						account: convertToEthereumAddress(fee.account),
						value: fee.value,
					})),
				}
				break
			}
			case "OPEN_SEA_V1": {
				request = {
					order,
					...order.take.assetType.assetClass === "ETH" ? {
						originFees: fillRequest.originFees?.map(payout => ({
							account: convertToEthereumAddress(payout.account),
							value: payout.value,
						})),
					} : {},
					infinite: fillRequest.infiniteApproval,
				}
				break
			}
			default: {
				throw new Error("Unsupported order type")
			}
		}

		if (fillRequest.itemId) {
			const {
				contract,
				tokenId,
			} = getEthereumItemId(fillRequest.itemId)
			request.assetType = {
				contract: toAddress(contract),
				tokenId,
			}
		}
		return request
	}

	private async commonFill(
		action: FillBatchOrderAction,
		request: PrepareFillRequest[],
	): Promise<PrepareFillBatchResponse> {
		const orders = await this.sdk.apis.order.getOrdersByIds({
			orderIds: { ids: request.map( o => toWord(this.filler.getOrderHashFromRequest(o))) },
		})
		let preparedOrders: CommonFillBatchResponse = {}
		for (const order of orders) {
			if (!isNft(order.make.assetType)) {
				throw new Error("Batch purchase do not supports bid orders")
			}

			if (order.take.assetType.assetClass !== "ETH") {
				throw new Error("Batch purchase supports order only for ETH currency")
			}
			switch (order.type) {
				case "RARIBLE_V2":
				case "OPEN_SEA_V1": {
					preparedOrders[toOrderId(`ETHEREUM:${order.hash}`)] = {
						order,
						multiple: await this.filler.isMultiple(order),
						maxAmount: await this.filler.getMaxAmount(order),
						baseFee: await this.sdk.order.getBaseOrderFillFee(order),
						...this.filler.getSupportFlags(order),
					}
					break
				}
				default:
					throw new Error("Batch purchase only support OPEN_SEA_V1 and RARIBLE_V2 order types")
			}
		}

		const submit = action
			.before((fillRequest: FillBatchRequest) => {
				return fillRequest.map(singleFillRequest => {
					const preparedOrder = preparedOrders[singleFillRequest.orderId]
					if (preparedOrder.order.type !== "RARIBLE_V2" && preparedOrder.order.type !== "OPEN_SEA_V1") {
						throw new Error("Batch purchase only support OPEN_SEA_V1 and RARIBLE_V2 order types")
					}
					if (singleFillRequest.unwrap) {
						throw new Error("Unwrap is not supported yet")
					}
					if (this.hasCollectionAssetType(preparedOrder.order)) {
						throw new Error("Batch purchase doesn't support collection orders")
					}
					return this.getFillOrderRequest(preparedOrder.order, singleFillRequest)
				})
			})
			.after((tx => new BlockchainEthereumTransaction(tx, this.network)))

		return {
			submit,
			preparedOrders,
		}
	}

	private hasCollectionAssetType(order: SimpleOrder) {
		return order.take.assetType.assetClass === "COLLECTION" || order.make.assetType.assetClass === "COLLECTION"
	}

	async buyBatch(request: PrepareFillRequest[]): Promise<PrepareFillBatchResponse> {
		return this.commonFill(this.sdk.order.buyBatch, request)
	}
}
