import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toAddress, toBinary, toOrderId, toUnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import { Order as EthereumOrder, Asset as EthereumAsset, OrderData as EthereumOrderData } from "@rarible/protocol-api-client"
import { AssetType, Order, Asset, PendingOrder, OrderData } from "@rarible/api-client"
import { AssetType as EthereumAssetType } from "@rarible/protocol-api-client/build/models/AssetType"
import { OrderExchangeHistory } from "@rarible/protocol-api-client/build/models/OrderExchangeHistory"
import { toBn } from "@rarible/utils/build/bn"
import { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../order/common"
import { getEthTakeAssetType } from "./common"

export class Bid {
	constructor(
		private sdk: RaribleSdk,
		private wallet: EthereumWallet
	) {
		this.bid = this.bid.bind(this)
	}


	convertAssetType(assetType: EthereumAssetType): AssetType {
		switch (assetType.assetClass) {
			case "ETH": {
				return {
					"@type": "ETH",
				}
			}
			case "ERC20": {
				return {
					"@type": "ERC20",
					contract: toUnionAddress(assetType.contract),
				}
			}
			case "ERC721": {
				return {
					"@type": "ERC721",
					contract: toUnionAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC721_LAZY": {
				return {
					"@type": "ERC721_Lazy",
					contract: toUnionAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					creators: assetType.creators.map(c => ({
						account: toUnionAddress(c.account),
						value: toBigNumber(c.value.toFixed()),
					})),
					royalties: assetType.royalties.map(r => ({
						account: toUnionAddress(r.account),
						value: toBigNumber(r.value.toFixed()),
					})),
					signatures: assetType.signatures.map(str => toBinary(str)),
				}
			}
			case "ERC1155": {
				return {
					"@type": "ERC1155",
					contract: toUnionAddress(assetType.contract),
					tokenId: assetType.tokenId,
				}
			}
			case "ERC1155_LAZY": {
				return {
					"@type": "ERC1155_Lazy",
					contract: toUnionAddress(assetType.contract),
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					supply: assetType.supply !== undefined ? toBigNumber(assetType.supply): toBigNumber("1"),
					creators: assetType.creators.map(c => ({
						account: toUnionAddress(c.account),
						value: toBigNumber(c.value.toFixed()),
					})),
					royalties: assetType.royalties.map(r => ({
						account: toUnionAddress(r.account),
						value: toBigNumber(r.value.toFixed()),
					})),
					signatures: assetType.signatures.map(str => toBinary(str)),
				}
			}
			case "GEN_ART": {
				return {
					"@type": "GEN_ART",
					contract: toUnionAddress(assetType.contract),
				}
			}
			default: {
				throw new Error(`Unsupported asset type ${assetType.assetClass}`)
			}
		}
	}

	getAsset(asset: EthereumAsset): Asset {
		return {
			type: this.convertAssetType(asset.assetType),
			value: asset.value,
		}
	}

	convertEthHistoryToUnion(history: OrderExchangeHistory): PendingOrder {
		switch (history.type) {
			case "CANCEL": {
				return {
					"@type": history.type,
					id: toOrderId(history.hash),
					make: history.make && this.getAsset(history.make),
					date: history.date,
					take: history.take && this.getAsset(history.take),
					maker: history.maker && toUnionAddress(history.maker),
					owner: history.owner && toUnionAddress(history.owner),
				}
			}
			case "ORDER_SIDE_MATCH": {
				return {
					...history,
					"@type": "ORDER_SIDE_MATCH",
					id: toOrderId(history.hash),
					make: history.make && this.getAsset(history.make),
					take: history.take && this.getAsset(history.take),
					maker: history.maker && toUnionAddress(history.maker),
					fill: history.fill,
					taker: history.taker && toUnionAddress(history.taker),
				}
			}
			default: {
				throw new Error("Unsupported order exchange history object")
			}
		}
	}

	convertOrderData(data: EthereumOrderData): OrderData {
		switch (data.dataType) {
			case "LEGACY": {
				return {
					"@type": "ETH_RARIBLE_V1",
					fee: toBigNumber(data.fee.toFixed()),
				}
			}
			case "RARIBLE_V2_DATA_V1": {
				return {
					"@type": "ETH_RARIBLE_V2",
					payouts: data.payouts.map(p => ({
						account: toUnionAddress(p.account),
						value: toBigNumber(p.value.toFixed()),
					})),
					originFees: data.originFees.map(fee => ({
						account: toUnionAddress(fee.account),
						value: toBigNumber(fee.value.toFixed()),
					})),
				}
			}
			case "OPEN_SEA_V1_DATA_V1": {
				return {
					...data,
					"@type": "ETH_OPEN_SEA_V1",
					exchange: toUnionAddress(data.exchange),
					feeRecipient: toUnionAddress(data.feeRecipient),
					callData: toBinary(data.callData),
					replacementPattern: toBinary(data.callData),
					staticExtraData: toBinary(data.staticExtraData),
					staticTarget: toUnionAddress(data.staticTarget),
				}
			}
			default: {
				throw new Error("Unsupported order data type")
			}
		}
	}

	convertOrderEthToUnion(order: EthereumOrder): Order {
		return {
			...order,
			id: toOrderId(order.hash),
			platform: "RARIBLE",
			maker: toUnionAddress(order.maker),
			taker: order.taker && toUnionAddress(order.taker),
			lastUpdatedAt: order.lastUpdateAt,
			priceHistory: order.priceHistory || [],
			make: this.getAsset(order.make),
			take: this.getAsset(order.take),
			pending: order?.pending?.map(this.convertEthHistoryToUnion) || [],
			data: this.convertOrderData(order.data),
		}
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		if (!prepare.itemId) {
			throw new Error("ItemId has not been specified")
		}

		const item = await this.sdk.apis.nftItem.getNftItemById({
			itemId: prepare.itemId,
		})
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: item.contract,
		})

		const submit = this.sdk.order.bid
			.before(async (request: OrderRequest) => {
				return {
					maker: toAddress(await this.wallet.ethereum.getFrom()),
					makeAssetType: getEthTakeAssetType(request.currency),
					takeAssetType: {
						tokenId: toBigNumber(item.tokenId),
						contract: toAddress(item.contract),
					},
					amount: request.amount,
					priceDecimal: toBn(request.price),
					payouts: request.payouts?.map(p => ({
						account: toAddress(p.account),
						value: p.value,
					})) || [],
					originFees: request.originFees?.map(fee => ({
						account: toAddress(fee.account),
						value: fee.value,
					})) || [],
				}
			})
			.after(order => toOrderId(`ETHEREUM:${order.hash}`))

		return {
			supportedCurrencies: [
				{ blockchain: "ETHEREUM", type: "NATIVE" },
				{ blockchain: "ETHEREUM", type: "ERC20" },
			],
			multiple: collection.type === "ERC1155",
			maxAmount: item.supply,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit,
		}
	}
}
