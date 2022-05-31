import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import type { FillBatchSingleOrderRequest } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type {
	SimpleOpenSeaV1Order,
	SimpleOrder,
	SimpleRaribleV2Order,
} from "@rarible/protocol-ethereum-sdk/build/order/types"
import { isNft } from "@rarible/protocol-ethereum-sdk/build/order/is-nft"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Blockchain } from "@rarible/api-client"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type {
	PrepareBatchFillResponse,
	PreparedFillBatchRequest,
	PrepareFillBatchRequestWithAmount,
	PrepareFillRequest,
} from "../../types/order/fill/domain"
import { EthereumFill } from "./fill"

export type SimplePreparedOrder = SimpleOrder & { makeStock: BigNumber }

export class EthereumFillBatch {
	filler: EthereumFill

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.buyBatch = this.buyBatch.bind(this)
		this.getPrepareFillResponse = this.getPrepareFillResponse.bind(this)
		this.filler = new EthereumFill(sdk, wallet, network)
	}

	async getPrepareFillResponse(request: PrepareFillRequest)
		: Promise<PreparedFillBatchRequest> {

		const orderHash = this.filler.getOrderHashFromRequest(request)
		const order = await this.sdk.apis.order.getOrderByHash({ hash: orderHash })

		if (!isNft(order.make.assetType)) {
			throw new Error("Batch purchase do not supports bid orders")
		}

		if (order.take.assetType.assetClass !== "ETH") {
			throw new Error("Batch purchase supports order only for ETH currency")
		}
		const { supportsBatchPurchase } = this.filler.getSupportFlags(order)
		return {
			blockchain: Blockchain.ETHEREUM,
			order,
			supportsBatchPurchase,
			multiple: await this.filler.isMultiple(order),
			maxAmount: await this.filler.getMaxAmount(order),
			baseFee: await this.sdk.order.getBaseOrderFillFee(order),
		}
	}

	private async commonFill(//todo move to buy batch method
		request: PrepareFillBatchRequestWithAmount[],
	): Promise<PrepareBatchFillResponse> {
		const orders: FillBatchSingleOrderRequest[] = request.map(fillRequestSingle => {
			switch (fillRequestSingle.order.type) {
				case "RARIBLE_V2": {
					return {
						order: <SimpleRaribleV2Order>fillRequestSingle.order,
						amount: fillRequestSingle.amount,
					}
				}
				case "OPEN_SEA_V1": {
					return {
						order: <SimpleOpenSeaV1Order>fillRequestSingle.order,
						amount: fillRequestSingle.amount,
					}
				}
				default:
					throw new Error("Batch purchase only support OPEN_SEA_V1 and RARIBLE_V2 order types")
			}
		})
		const tx = await this.sdk.order.buyBatch(orders)
		return new BlockchainEthereumTransaction(tx, this.network)
	}

	async buyBatch(request: PrepareFillBatchRequestWithAmount[]): Promise<PrepareBatchFillResponse> {
		return this.commonFill(request)
	}
}
