import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { EthErc20AssetType, EthEthereumAssetType, FlowAssetType } from "@rarible/api-client"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress } from "@rarible/types"
import { SellRequest } from "../../order/sell/domain"
import type { ISell, PrepareSellRequest, PrepareSellResponse } from "../../order/sell/domain"

export class Sell implements ISell {
	constructor(private sdk: RaribleSdk, private wallet: EthereumWallet) {
	}

	private getEthTakeAssetType(currency: EthEthereumAssetType | EthErc20AssetType | FlowAssetType) {
		switch (currency["@type"]) {
			case "ERC20": {
				return {
					assetClass: currency["@type"],
					contract: toAddress(currency.contract),
				}
			}
			case "ETH": {
				return {
					assetClass: currency["@type"],
				}
			}
			default: {
				throw Error("Invalid take asset type")
			}
		}
	}

	async prepare(request: PrepareSellRequest): Promise<PrepareSellResponse> {
		const item = await this.sdk.apis.nftItem.getNftItemById({ itemId: request.itemId })
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: SellRequest) => {
				const takeAssetType = this.getEthTakeAssetType(sellFormRequest.currency)
				return {
					maker: toAddress(await this.wallet.ethereum.getFrom()),
					makeAssetType: {
						tokenId: toBigNumber(request.itemId),
						contract: toAddress(item.contract),
					},
					amount: parseInt(sellFormRequest.amount),
					takeAssetType,
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
			.after(() => {})

		return {
			supportedCurrencies: [
				{ blockchain: "ETHEREUM", type: "NATIVE" },
				{ blockchain: "ETHEREUM", type: "ERC20" },
			],
			maxAmount: item.supply,
			baseFee: await this.sdk.order.getBaseOrderFee("RARIBLE_V2"),
			submit: sellAction,
		}
	}
}
