import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber, toWord } from "@rarible/types"
import type {
	FillOrderAction,
	FillOrderRequest,
	RaribleV2OrderFillRequestV3Buy,
	RaribleV2OrderFillRequestV3Sell,
} from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import { BigNumber as BigNumberClass } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { isNft } from "@rarible/protocol-ethereum-sdk/build/order/is-nft"
import { getOwnershipId } from "@rarible/protocol-ethereum-sdk/build/common/get-ownership-id"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import {
	convertOrderIdToEthereumHash,
	convertToEthereumAddress,
	getEthereumItemId,
	toEthereumParts,
	validateOrderDataV3Request,
} from "./common"
import type { IEthereumSdkConfig } from "./domain"

export type SupportFlagsResponse = {
	originFeeSupport: OriginFeeSupport,
	payoutsSupport: PayoutsSupport,
	maxFeesBasePointSupport: MaxFeesBasePointSupport,
	supportsPartialFill: boolean
}

export type SimplePreparedOrder = SimpleOrder & { makeStock: BigNumber }

export class EthereumFill {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
		private config?: IEthereumSdkConfig
	) {
		this.fill = this.fill.bind(this)
		this.buy = this.buy.bind(this)
		this.acceptBid = this.acceptBid.bind(this)
	}

	getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillOrderRequest {
		let request: FillOrderRequest
		switch (order.type) {
			case "RARIBLE_V1": {
				request = {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					originFee: fillRequest.originFees?.[0]?.value ? fillRequest.originFees[0].value : 0,
					payout: fillRequest.payouts?.[0]?.account
						? convertToEthereumAddress(fillRequest.payouts[0].account)
						: undefined,
				}
				break
			}
			case "RARIBLE_V2": {
				request = {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					payouts: toEthereumParts(fillRequest.payouts),
					originFees: toEthereumParts(fillRequest.originFees),
				}

				switch (order.data.dataType) {
					case "RARIBLE_V2_DATA_V3_BUY":
						validateOrderDataV3Request(fillRequest, { shouldProvideMaxFeesBasePoint: true });
						(request as RaribleV2OrderFillRequestV3Sell).maxFeesBasePoint = fillRequest.maxFeesBasePoint!;
						(request as RaribleV2OrderFillRequestV3Sell).marketplaceMarker =
							this.config?.marketplaceMarker ? toWord(this.config?.marketplaceMarker) : undefined
						break
					case "RARIBLE_V2_DATA_V3_SELL":
						(request as RaribleV2OrderFillRequestV3Buy).marketplaceMarker =
							this.config?.marketplaceMarker ? toWord(this.config?.marketplaceMarker) : undefined
						validateOrderDataV3Request(fillRequest, { shouldProvideMaxFeesBasePoint: false })
						break
					default:
				}
				break
			}
			case "OPEN_SEA_V1": {
				request = {
					order,
					originFees: order.take.assetType.assetClass === "ETH" ? toEthereumParts(fillRequest.originFees) : [],
					payouts: toEthereumParts(fillRequest.payouts),
					infinite: fillRequest.infiniteApproval,
				}
				break
			}
			case "SEAPORT_V1": {
				request = {
					order,
					originFees: toEthereumParts(fillRequest.originFees),
					amount: fillRequest.amount,
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

	getSupportFlags(order: SimpleOrder): SupportFlagsResponse {
		switch (order.type) {
			case "RARIBLE_V1": {
				return {
					originFeeSupport: OriginFeeSupport.AMOUNT_ONLY,
					payoutsSupport: PayoutsSupport.SINGLE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill: true,
				}
			}
			case "RARIBLE_V2": {
				switch (order.data.dataType) {
					case "RARIBLE_V2_DATA_V3_BUY":
						return {
							originFeeSupport: OriginFeeSupport.FULL,
							payoutsSupport: PayoutsSupport.SINGLE,
							maxFeesBasePointSupport: MaxFeesBasePointSupport.REQUIRED,
							supportsPartialFill: true,
						}
					case "RARIBLE_V2_DATA_V3_SELL":
						return {
							originFeeSupport: OriginFeeSupport.FULL,
							payoutsSupport: PayoutsSupport.SINGLE,
							maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
							supportsPartialFill: true,
						}
					case "RARIBLE_V2_DATA_V2":
					default:
						return {
							originFeeSupport: OriginFeeSupport.FULL,
							payoutsSupport: PayoutsSupport.MULTIPLE,
							maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
							supportsPartialFill: true,
						}
				}
			}
			case "OPEN_SEA_V1": {
				return {
					originFeeSupport: order.take.assetType.assetClass === "ETH" ? OriginFeeSupport.FULL : OriginFeeSupport.NONE,
					payoutsSupport: PayoutsSupport.SINGLE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill: false,
				}
			}
			case "SEAPORT_V1": {
				const supportsPartialFill = order.data.orderType === "PARTIAL_OPEN" || order.data.orderType === "PARTIAL_RESTRICTED"
				return {
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.NONE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill,
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

	hasCollectionAssetType(order: SimplePreparedOrder) {
		return order.take.assetType.assetClass === "COLLECTION" || order.make.assetType.assetClass === "COLLECTION"
	}

	private async commonFill(action: FillOrderAction, request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const orderHash = this.getOrderHashFromRequest(request)
		const order = await this.sdk.apis.order.getOrderByHash({ hash: orderHash })

		const submit = action
			.before((fillRequest: FillRequest) => {
				if (fillRequest.unwrap) {
					throw new Error("Unwrap is not supported yet")
				}
				if (this.hasCollectionAssetType(order) && !fillRequest.itemId) {
					throw new Error("For collection order you should pass itemId")
				}
				return this.getFillOrderRequest(order, fillRequest)
			})
			.after((tx => new BlockchainEthereumTransaction(tx, this.network)))

		return {
			...this.getSupportFlags(order),
			multiple: await this.isMultiple(order),
			maxAmount: await this.getMaxAmount(order),
			baseFee: await this.sdk.order.getBaseOrderFillFee(order),
			submit,
		}
	}

	/**
	 * @deprecated
	 * @param request
	 */
	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.commonFill(this.sdk.order.fill, request)
	}

	async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.commonFill(this.sdk.order.buy, request)
	}

	async acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		return this.commonFill(this.sdk.order.acceptBid, request)
	}
}
