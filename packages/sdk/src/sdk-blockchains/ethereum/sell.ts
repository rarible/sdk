import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress, toOrderId } from "@rarible/types"
import { SellRequest } from "../../order/sell/domain"
import type { PrepareSellRequest, PrepareSellResponse } from "../../order/sell/domain"
import { getEthTakeAssetType } from "./common"

export class Sell {
	constructor(private sdk: RaribleSdk, private wallet: EthereumWallet) {
		this.sell = this.sell.bind(this)
	}

	async sell(request: PrepareSellRequest): Promise<PrepareSellResponse> {
		const item = await this.sdk.apis.nftItem.getNftItemById({ itemId: request.itemId })
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: SellRequest) => {
				return {
					maker: toAddress(await this.wallet.ethereum.getFrom()),
					makeAssetType: {
						tokenId: toBigNumber(item.tokenId),
						contract: toAddress(item.contract),
					},
					amount: parseInt(sellFormRequest.amount),
					takeAssetType: getEthTakeAssetType(sellFormRequest.currency),
					price: sellFormRequest.price,
					payouts: sellFormRequest.payouts?.map(p => ({
						account: toAddress(p.account),
						value: parseInt(p.value),
					})) || [],
					originFees: sellFormRequest.originFees?.map(fee => ({
						account: toAddress(fee.account),
						value: parseInt(fee.value),
					})) || [],
				}
			})
			.after((order) =>  toOrderId(order.hash))


		return {
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
