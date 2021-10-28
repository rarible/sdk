import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress, toOrderId } from "@rarible/types"
import { OrderRequest, PrepareOrderRequest, PrepareOrderResponse } from "../../order/common"
import { getEthTakeAssetType } from "./common"

export class Sell {
	constructor(private sdk: RaribleSdk, private wallet: EthereumWallet) {
		this.sell = this.sell.bind(this)
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
						account: toAddress(p.account),
						value: p.value,
					})) || [],
					originFees: sellFormRequest.originFees?.map(fee => ({
						account: toAddress(fee.account),
						value: fee.value,
					})) || [],
				}
			})
			.after((order) => toOrderId(`ETHEREUM:${order.hash}`))

		return {
			multiple: collection.type === "ERC1155",
			supportedCurrencies: [
				{ blockchain: "ETHEREUM", type: "NATIVE" },
				{ blockchain: "ETHEREUM", type: "ERC20" },
			],
			maxAmount: item.supply,
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellAction,
		}
	}
}
