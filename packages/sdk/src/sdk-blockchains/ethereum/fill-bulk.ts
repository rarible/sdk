import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type {
	BulkFillRequest,
	FillOrderBulkAction,
	FillOrderRequest,
} from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import { BigNumber as BigNumberClass } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { isNft } from "@rarible/protocol-ethereum-sdk/build/order/is-nft"
import { getOwnershipId } from "@rarible/protocol-ethereum-sdk/build/common/get-ownership-id"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type {
	FillOrderBulkRequest,
	FillRequest,
	PrepareBulkFillResponse,
	PrepareFillRequest,
} from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { convertOrderIdToEthereumHash } from "./common"

export type SupportFlagsResponse = {
	originFeeSupport: OriginFeeSupport,
	payoutsSupport: PayoutsSupport,
	supportsPartialFill: boolean
}

export type SimplePreparedOrder = SimpleOrder & { makeStock: BigNumber }

export class EthereumFillBulk {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.buyBulk = this.buyBulk.bind(this)
	}

	getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillOrderBulkRequest {
		let request: FillOrderRequest
		switch (order.type) {
			case "RARIBLE_V2": {
				request = {
					order,
					amount: "amount" in fillRequest ? fillRequest.amount : 1,
					infinite: fillRequest.infiniteApproval,
				}
				break
			}
			case "OPEN_SEA_V1": {
				request = {
					order,
					infinite: fillRequest.infiniteApproval,
				}
				break
			}
			default: {
				throw new Error("Unsupported order type")
			}
		}

		return request
	}

	getSupportFlags(order: SimpleOrder): SupportFlagsResponse {
		switch (order.type) {
			case "RARIBLE_V1": {
				return {
					originFeeSupport: OriginFeeSupport.AMOUNT_ONLY,
					payoutsSupport: PayoutsSupport.SINGLE,
					supportsPartialFill: true,
				}
			}
			case "RARIBLE_V2": {
				return {
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.MULTIPLE,
					supportsPartialFill: true,
				}
			}
			case "OPEN_SEA_V1": {
				return {
					originFeeSupport: OriginFeeSupport.NONE,
					payoutsSupport: PayoutsSupport.NONE,
					supportsPartialFill: false,
				}
			}
			default:
				throw new Error("Unsupported order type")
		}
	}

	async getMaxAmount(order: SimplePreparedOrder): Promise<BigNumber | null> {
		if (order.take.assetType.assetClass === "COLLECTION") {
			return null
		}
		if (isNft(order.take.assetType)) {
			if (this.wallet === undefined) {
				throw new Error("Wallet undefined")
			}
			const address = await this.wallet.ethereum.getFrom()
			const ownershipId = getOwnershipId(
				order.take.assetType.contract,
				order.take.assetType.tokenId,
				toAddress(address),
			)

			const ownership = await this.sdk.apis.nftOwnership.getNftOwnershipById({ ownershipId })

			return toBigNumber(BigNumberClass.min(ownership.value, order.take.value).toFixed())
		}
		return order.makeStock
	}

	async isMultiple(order: SimplePreparedOrder): Promise<boolean> {
		let contract: string

		if (isNft(order.take.assetType) || order.take.assetType.assetClass === "COLLECTION") {
			contract = order.take.assetType.contract
		} else if (isNft(order.make.assetType) || order.make.assetType.assetClass === "COLLECTION") {
			contract = order.make.assetType.contract
		} else {
			throw new Error("Nft has not been found")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		return collection.type === "ERC1155"
	}

	getOrderHashFromRequest(request: PrepareFillRequest): string {
		if ("order" in request) {
			return convertOrderIdToEthereumHash(request.order.id)
		} else if ("orderId" in request) {
			return convertOrderIdToEthereumHash(request.orderId)
		}
		throw new Error("OrderId has not been found in request")
	}

	private async commonFill(
		action: FillOrderBulkAction, request: PrepareFillRequest[],
	): Promise<PrepareBulkFillResponse> {
		const ordersPrepare = await Promise.all(request.map(async r => {
			const orderHash = this.getOrderHashFromRequest(r)
			return this.sdk.apis.order.getOrderByHash({ hash: orderHash })
		}))

		const submit = action
			.before((fillRequest: FillRequest[]) => {
				const bulkFillRequest: BulkFillRequest[] = fillRequest.map((fillRequestSingle, index) => {
					return this.getFillOrderRequest(ordersPrepare[index], fillRequestSingle)
				})
				return bulkFillRequest
			})
			.after(tx => new BlockchainEthereumTransaction(tx, this.network))

		return {
			preparedFillResponse: await Promise.all(ordersPrepare.map(async order => ({
				...this.getSupportFlags(order),
				multiple: await this.isMultiple(order),
				maxAmount: await this.getMaxAmount(order),
				baseFee: await this.sdk.order.getBaseOrderFillFee(order),
			}))),
			submit,
		}
	}

	async buyBulk(request: PrepareFillRequest[]): Promise<PrepareBulkFillResponse> {
		return this.commonFill(this.sdk.order.buyBulk, request)
	}
}
