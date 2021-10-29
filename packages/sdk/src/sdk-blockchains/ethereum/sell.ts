import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress, toWord } from "@rarible/types"
import {
	OrderRequest, OrderUpdateRequest,
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../order/common"
import {
	convertOrderHashToOrderId,
	convertUnionToEthereumAddress,
	getEthTakeAssetType,
	getSupportedCurrencies,
} from "./common"

export class Sell {
	constructor(private sdk: RaribleSdk, private wallet: EthereumWallet) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const [domain, contract, tokenId] = request.itemId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const item = await this.sdk.apis.nftItem.getNftItemById({ itemId: `${contract}:${tokenId}` })
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderRequest) => {
				return {
					maker: toAddress(await this.wallet.ethereum.getFrom()),
					makeAssetType: {
						tokenId: toBigNumber(item.tokenId),
						contract: toAddress(item.contract),
					},
					amount: sellFormRequest.amount,
					takeAssetType: getEthTakeAssetType(sellFormRequest.currency),
					priceDecimal: sellFormRequest.price,
					payouts: sellFormRequest.payouts?.map(p => ({
						account: convertUnionToEthereumAddress(p.account),
						value: p.value,
					})) || [],
					originFees: sellFormRequest.originFees?.map(fee => ({
						account: convertUnionToEthereumAddress(fee.account),
						value: fee.value,
					})) || [],
				}
			})
			.after((order) => convertOrderHashToOrderId(order.hash))

		return {
			multiple: collection.type === "ERC1155",
			supportedCurrencies: getSupportedCurrencies(),
			maxAmount: item.supply,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellAction,
		}
	}

	async update(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, orderId] = prepareRequest.orderId.split(":")
		if (blockchain !== "ETHEREUM") {
			throw new Error("Not an ethereum order")
		}

		const sellUpdateAction = this.sdk.order.sellUpdate
			.before((request: OrderUpdateRequest) => {
				return {
					orderHash: toWord(orderId),
					priceDecimal: request.price,
				}
			})
			.after(order => convertOrderHashToOrderId(order.hash))

		return {
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellUpdateAction,
		}
	}
}
