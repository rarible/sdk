import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber, toWord } from "@rarible/types"
import type {
	FillBatchSingleOrderRequest,
	FillOrderAction,
	FillOrderRequest,
	RaribleV2OrderFillRequestV3Buy,
	RaribleV2OrderFillRequestV3Sell,

	AmmOrderFillRequest } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import { BigNumber as BigNumberClass } from "@rarible/utils/build/bn"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { isNft } from "@rarible/protocol-ethereum-sdk/build/order/is-nft"
import { getOwnershipId } from "@rarible/protocol-ethereum-sdk/build/common/get-ownership-id"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { OrderId } from "@rarible/api-client"
import type { Order } from "@rarible/ethereum-api-client/build/models/Order"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client"
import type { Blockchain } from "@rarible/api-client"
import { Warning } from "@rarible/logger/build"
import type {
	BatchFillRequest,
	FillRequest,
	IBatchBuyTransactionResult,
	PrepareBatchBuyResponse,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { BuyAmmInfoRequest } from "../../types/balances"
import type { AcceptBidSimplifiedRequest, BuySimplifiedRequest } from "../../types/order/fill/simplified"
import {
	convertOrderIdToEthereumHash,
	convertToEthereumAddress,
	getAssetTypeFromFillRequest,
	getEthereumItemId,
	getOrderId,
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
		private config?: IEthereumSdkConfig,
	) {
		this.fill = this.fill.bind(this)
		this.buy = this.buy.bind(this)
		this.batchBuy = this.batchBuy.bind(this)
		this.acceptBid = this.acceptBid.bind(this)
		this.buyBasic = this.buyBasic.bind(this)
		this.acceptBidBasic = this.acceptBidBasic.bind(this)
		this.batchBuyBasic = this.batchBuyBasic.bind(this)
		this.getBuyAmmInfo = this.getBuyAmmInfo.bind(this)
	}

	async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
		const prepare = await this.buy(request)
		return prepare.submit(request)
	}

	async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
		const prepare = await this.acceptBid(request)
		return prepare.submit(request)
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
			case "LOOKSRARE": {
				request = {
					order,
					originFees: toEthereumParts(fillRequest.originFees),
					amount: fillRequest.amount,
				}
				break
			}
			case "X2Y2": {
				request = {
					order,
					originFees: toEthereumParts(fillRequest.originFees),
					amount: fillRequest.amount,
				}
				break
			}
			case "AMM": {
				return {
					order,
					originFees: toEthereumParts(fillRequest.originFees),
					amount: fillRequest.amount,
					assetType: getAssetTypeFromFillRequest(fillRequest.itemId) as AmmOrderFillRequest["assetType"],
					addRoyalty: fillRequest.addRoyalties,
				} as AmmOrderFillRequest
			}
			default: {
				throw new Error("Unsupported order type")
			}
		}

		if (fillRequest.addRoyalties) {
			throw new Warning("Adding royalties is available only for AMM orders")
		}

		if (fillRequest.itemId) {
			if (Array.isArray(fillRequest.itemId)) {
				throw new Error("Array of itemIds is supported only for AMM orders")
			}
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
			case "LOOKSRARE": {
				return {
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.NONE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill: true,
				}
			}
			case "AMM": {
				return {
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.NONE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
					supportsPartialFill: true,
				}
			}
			case "X2Y2": {
				return {
					originFeeSupport: OriginFeeSupport.FULL,
					payoutsSupport: PayoutsSupport.NONE,
					maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
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
		} else if (order.make.assetType.assetClass === "AMM_NFT") {
			return false
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

	async batchBuy(prepareRequest: PrepareFillRequest[]): Promise<PrepareBatchBuyResponse> {
		const orders: Record<OrderId, Order> = {} // ethereum orders cache

		const submit = this.sdk.order.buyBatch.around(
			(request: BatchFillRequest) => {
				return request.map((req) => {
					console.log("batch around", request)
					const order = orders[req.orderId]
					if (!order) {
						throw new Error(`Order with id ${req.orderId} not precached`)
					}

					if (req.unwrap) {
						throw new Error("Unwrap is not supported yet")
					}

					return this.getFillOrderRequest(order, req) as FillBatchSingleOrderRequest
				})
			},
			(tx, request: BatchFillRequest) => {
				return new BlockchainEthereumTransaction<IBatchBuyTransactionResult>(
					tx,
					this.network,
					async (getEvents) => {
						try {
							const events: any = await getEvents() || []
							let executionEvents: any[] = []

							for (let event of events) {
								if ("0" in event && event[0]?.event === "Execution") {
									if (Array.isArray(event)) {
										executionEvents.push(...event)
									} else {
										// cycling over events "subarray", because web3 provider
										// returning it not as real array, but as object
										let i = 0
										while (event[i]) {
											executionEvents.push(event[i])
											i += 1
										}
									}
								} else if (event.event === "Execution") {
									executionEvents.push(event)
								}
							}

							if (executionEvents) {
								return {
									type: "BATCH_BUY",
									results: request.map((req, index) => ({
										orderId: req.orderId,
										result: (
											executionEvents[index]?.data || // ethers variant
											executionEvents[index]?.raw?.data // web3 variant
										) === "0x0000000000000000000000000000000000000000000000000000000000000001",
									})),
								}
							} else {
								return undefined
							}
						} catch (e) {
							console.error("Can't parse transaction events", e)
							return undefined
						}
					},
				)
			},
		)

		const prepared = await Promise.all(prepareRequest.map(async (req) => {
			const orderHash = this.getOrderHashFromRequest(req)
			const ethOrder = await this.sdk.apis.order.getOrderByHash({ hash: orderHash })
			const orderId = getOrderId(req)
			orders[orderId] = ethOrder

			if (ethOrder.status !== "ACTIVE") {
				throw new Error(`Order with id ${orderId} is not active`)
			}

			if (
				ethOrder.type !== "OPEN_SEA_V1" &&
				ethOrder.type !== "RARIBLE_V2" &&
				ethOrder.type !== "SEAPORT_V1" &&
				ethOrder.type !== "LOOKSRARE" &&
				ethOrder.type !== "AMM" &&
				ethOrder.type !== "X2Y2"
			) {
				throw new Error(`Order type ${ethOrder.type} is not supported for batch buy`)
			}

			if (
				ethOrder.make.assetType.assetClass === "ETH" ||
				ethOrder.make.assetType.assetClass === "ERC20"
			) {
				throw new Error("Bid orders is not supported")
			}

			return {
				orderId,
				...this.getSupportFlags(ethOrder),
				multiple: await this.isMultiple(ethOrder),
				maxAmount: await this.getMaxAmount(ethOrder),
				baseFee: await this.sdk.order.getBaseOrderFillFee(ethOrder),
			}
		}))

		return {
			submit,
			prepared,
		}
	}

	getBuyAmmInfo(request: BuyAmmInfoRequest): Promise<AmmTradeInfo> {
		return this.sdk.order.getBuyAmmInfo({
			hash: request.hash,
			numNFTs: request.numNFTs,
		})
	}

	async batchBuyBasic(
		request: BatchFillRequest
	): Promise<IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>> {
		const response = await this.batchBuy(request)
		return response.submit(request)
	}
}
