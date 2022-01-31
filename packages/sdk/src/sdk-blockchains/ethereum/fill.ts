import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import type { Order } from "@rarible/api-client"
import * as EthereumApiClient from "@rarible/ethereum-api-client"
import type {
	FillOrderAction,
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
import type { FillRequest, PrepareFillRequest, PrepareFillResponse } from "../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { convertToEthereumAddress, convertToEthereumAssetType, isEVMBlockchain } from "./common"

export type SupportFlagsResponse = {
	originFeeSupport: OriginFeeSupport,
	payoutsSupport: PayoutsSupport,
	supportsPartialFill: boolean
}

export type SimplePreparedOrder = SimpleOrder & { makeStock: BigNumber }

export class EthereumFill {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.fill = this.fill.bind(this)
		this.buy = this.buy.bind(this)
		this.acceptBid = this.acceptBid.bind(this)
	}

	convertToSimpleOrder(order: Order): SimplePreparedOrder {
		const common = {
			maker: convertToEthereumAddress(order.maker),
			taker: order.taker && convertToEthereumAddress(order.taker),
			make: {
				assetType: convertToEthereumAssetType(order.make.type),
				value: order.make.value,
			},
			take: {
				assetType: convertToEthereumAssetType(order.take.type),
				value: order.take.value,
			},
			salt: toWord(order.salt),
			start: order.startedAt !== undefined ? parseInt(order.startedAt) : undefined,
			end: order.endedAt !== undefined ? parseInt(order.endedAt): undefined,
			signature: order.signature !== undefined ? toBinary(order.signature) : undefined,
			makeStock: order.makeStock,
		}
		switch (order.data["@type"]) {
			case "ETH_RARIBLE_V1": {
				return {
					...common,
					type: "RARIBLE_V1",
					data: {
						dataType: "LEGACY",
						fee: parseInt(order.data.fee),
					},
				}
			}
			case "ETH_RARIBLE_V2": {
				return {
					...common,
					type: "RARIBLE_V2",
					data: {
						dataType: "RARIBLE_V2_DATA_V1",
						payouts: order.data.payouts.map(p => ({
							account: convertToEthereumAddress(p.account),
							value: p.value,
						})),
						originFees: order.data.originFees.map(fee => ({
							account: convertToEthereumAddress(fee.account),
							value: fee.value,
						})),
					},
				}
			}
			case "ETH_CRYPTO_PUNKS": {
				return {
					...common,
					type: "CRYPTO_PUNK",
					data: {
						dataType: "CRYPTO_PUNKS_DATA",
					},
				}
			}
			case "ETH_OPEN_SEA_V1": {
				return {
					...common,
					type: "OPEN_SEA_V1",
					data: {
						...order.data,
						dataType: "OPEN_SEA_V1_DATA_V1",
						exchange: convertToEthereumAddress(order.data.exchange),
						feeRecipient: convertToEthereumAddress(order.data.feeRecipient),
						feeMethod: EthereumApiClient.OrderOpenSeaV1DataV1FeeMethod[order.data.feeMethod],
						side: EthereumApiClient.OrderOpenSeaV1DataV1Side[order.data.side],
						saleKind: EthereumApiClient.OrderOpenSeaV1DataV1SaleKind[order.data.saleKind],
						howToCall: EthereumApiClient.OrderOpenSeaV1DataV1HowToCall[order.data.howToCall],
						callData: toBinary(order.data.callData),
						replacementPattern: toBinary(order.data.callData),
						staticExtraData: toBinary(order.data.staticExtraData),
						staticTarget: convertToEthereumAddress(order.data.staticTarget),
					},
				}
			}
			default: {
				throw new Error(`Unsupported order data type ${order.data["@type"]}`)
			}
		}
	}

	getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillOrderRequest {
		let request: FillOrderRequest
		switch (order.type) {
			case "RARIBLE_V1": {
				request = {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					originFee: fillRequest.originFees?.[0]?.value ? fillRequest.originFees[0].value: 0,
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
					infinite: fillRequest.infiniteApproval,
				}
				break
			}
			default: {
				throw new Error("Unsupported order type")
			}
		}

		if (fillRequest.assetType) {
			request.assetType = {
				contract: convertToEthereumAddress(fillRequest.assetType.contract),
				tokenId: fillRequest.assetType.tokenId,
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
			default: throw new Error("Unsupported order type")
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
				toAddress(address)
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

	async getPreparedOrder(request: PrepareFillRequest): Promise<SimplePreparedOrder> {
		if ("order" in request) {
			return this.convertToSimpleOrder(request.order)
		} else if ("orderId" in request) {
			const [domain, hash] = request.orderId.split(":")
			if (!isEVMBlockchain(domain)) {
				throw new Error("Not an ethereum order")
			}
			return this.sdk.apis.order.getOrderByHash({ hash })
		}
		throw new Error("Incorrect request")
	}

	hasCollectionAssetType(order: SimplePreparedOrder) {
		return order.take.assetType.assetClass === "COLLECTION" || order.make.assetType.assetClass === "COLLECTION"
	}

	private async commonFill(action: FillOrderAction, request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const order = await this.getPreparedOrder(request)

		const submit = action
			.before((fillRequest: FillRequest) => {
				if (this.hasCollectionAssetType(order) && !fillRequest.assetType) {
					throw new Error("For collection order you should pass asset type")
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
