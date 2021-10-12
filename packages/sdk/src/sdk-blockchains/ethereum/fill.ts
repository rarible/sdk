import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import { AssetType, Order } from "@rarible/api-client"
import { AssetType as EthereumAssetType } from "@rarible/protocol-api-client"
import { FillOrderRequest } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import {
	SimpleLegacyOrder,
	SimpleOpenSeaV1Order, SimpleOrder,
	SimpleRaribleV2Order,
} from "@rarible/protocol-ethereum-sdk/build/order/types"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { BigNumber } from "@rarible/types/build/big-number"
import {
	FillRequest,
	OriginFeeSupport,
	PayoutsSupport,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../order/fill/domain"

export class Fill {
	constructor(private sdk: RaribleSdk) {
		this.fill = this.fill.bind(this)
	}

	convertAssetType(assetType: AssetType): EthereumAssetType {
		switch (assetType["@type"]) {
			case "ETH": {
				return {
					assetClass: "ETH",
				}
			}
			case "ERC20": {
				return {
					assetClass: "ERC20",
					contract: toAddress(assetType.contract),
				}
			}
			case "ERC721": {
				return {
					assetClass: "ERC721",
					contract: toAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC721_Lazy": {
				return {
					assetClass: "ERC721_LAZY",
					contract: toAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					creators: assetType.creators.map(c => ({
						account: toAddress(c.account),
						value: toBn(c.value).toNumber(),
					})),
					royalties: assetType.royalties.map(r => ({
						account: toAddress(r.account),
						value: toBn(r.value).toNumber(),
					})),
					signatures: assetType.signatures.map(str => toBinary(str)),
				}
			}
			case "ERC1155": {
				return {
					assetClass: "ERC1155",
					contract: toAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC1155_Lazy": {
				return {
					assetClass: "ERC1155_LAZY",
					contract: toAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					supply: assetType.supply !== undefined ? toBigNumber(assetType.supply): toBigNumber("1"),
					creators: assetType.creators.map(c => ({
						account: toAddress(c.account),
						value: toBn(c.value).toNumber(),
					})),
					royalties: assetType.royalties.map(r => ({
						account: toAddress(r.account),
						value: toBn(r.value).toNumber(),
					})),
					signatures: assetType.signatures.map(str => toBinary(str)),
				}
			}
			case "GEN_ART": {
				return {
					assetClass: "GEN_ART",
					contract: toAddress(assetType.contract),
				}
			}
			default: {
				throw new Error(`Unsupported asset type ${assetType["@type"]}`)
			}
		}
	}

	convertToSimpleOrder(order: Order): SimpleLegacyOrder | SimpleRaribleV2Order | SimpleOpenSeaV1Order {
		const common = {
			maker: toAddress(order.maker),
			taker: order.taker && toAddress(order.taker),
			make: {
				assetType: this.convertAssetType(order.make.type),
				value: order.make.value,
			},
			take: {
				assetType: this.convertAssetType(order.take.type),
				value: order.take.value,
			},
			salt: toWord(order.salt),
			start: order.startedAt !== undefined ? parseInt(order.startedAt) : undefined,
			end: order.endedAt !== undefined ? parseInt(order.endedAt): undefined,
			signature: order.signature !== undefined ? toBinary(order.signature) : undefined,

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
							account: toAddress(p.account),
							value: parseInt(p.value),
						})),
						originFees: order.data.originFees.map(fee => ({
							account: toAddress(fee.account),
							value: parseInt(fee.value),
						})),
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
						exchange: toAddress(order.data.exchange),
						feeRecipient: toAddress(order.data.feeRecipient),
						callData: toBinary(order.data.callData),
						replacementPattern: toBinary(order.data.callData),
						staticExtraData: toBinary(order.data.staticExtraData),
						staticTarget: toAddress(order.data.staticTarget),
					},
				}
			}
			default: {
				throw new Error(`Unsupported order data type ${order.data["@type"]}`)
			}
		}
	}

	getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillOrderRequest {
		switch (order.type) {
			case "RARIBLE_V1": {
				return {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					originFee: fillRequest.originFees?.[0]?.value ? parseInt(fillRequest.originFees[0].value): 0,
					payout: fillRequest.payouts?.[0]?.account ? toAddress(fillRequest.payouts[0].account): undefined,
				}
			}
			case "RARIBLE_V2": {
				return {
					order,
					amount: fillRequest.amount,
					infinite: fillRequest.infiniteApproval,
					payouts: fillRequest.payouts?.map(payout => ({
						account: toAddress(payout.account),
						value: parseInt(payout.value),
					})),
					originFees: fillRequest.originFees?.map(fee => ({
						account: toAddress(fee.account),
						value: parseInt(fee.value),
					})),
				}
			}
			case "OPEN_SEA_V1": {
				return {
					order,
					infinite: fillRequest.infiniteApproval,
				}
			}
			default: {
				throw new Error("Unsupported order type")
			}
		}
	}

	getPayoutsSupport(order: SimpleOrder) {
		switch (order.type) {
			case "RARIBLE_V1": return PayoutsSupport.SINGLE
			case "RARIBLE_V2": return PayoutsSupport.MULTIPLE
			case "OPEN_SEA_V1": return PayoutsSupport.NONE
			default: throw new Error("Unsupported order type")
		}
	}

	getOriginFeeSupport(order: SimpleOrder) {
		switch (order.type) {
			case "RARIBLE_V1": return OriginFeeSupport.AMOUNT_ONLY
			case "RARIBLE_V2": return OriginFeeSupport.FULL
			case "OPEN_SEA_V1": return OriginFeeSupport.NONE
			default: throw new Error("Unsupported order type")
		}
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		let order: SimpleOrder
		let makeStock: BigNumber

		if ("order" in request) {
			order = this.convertToSimpleOrder(request.order)
			makeStock = request.order.makeStock
		} else if ("orderId" in request) {
			const fullOrder = await this.sdk.apis.order.getOrderByHash({ hash: request.orderId })
			makeStock = fullOrder.makeStock
			order = fullOrder
		} else {
			throw new Error("Incorrect request")
		}

		const submit = this.sdk.order.fill
			.before((fillRequest: FillRequest) => this.getFillOrderRequest(order, fillRequest))
			.after((tx => new BlockchainEthereumTransaction(tx)))

		return {
			maxAmount: makeStock,
			baseFee: await this.sdk.order.getBaseOrderFillFee(order),
			originFeeSupport: this.getOriginFeeSupport(order),
			payoutsSupport: this.getPayoutsSupport(order),
			submit,
		}
	}
}
