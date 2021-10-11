import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { PrepareSellRequest, PrepareSellResponse } from "./domain"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { EthErc20AssetType, EthEthereumAssetType, FlowAssetType, ItemControllerApi } from "@rarible/api-client"
import { BigNumber, toBigNumber } from "@rarible/types/build/big-number"
import { SellRequest } from "@rarible/protocol-ethereum-sdk/build/order/sell"
import { toAddress } from "@rarible/types"

// temp type
type SellReq = {
	amount: BigNumber
	price: BigNumber
	currency: EthErc20AssetType | EthEthereumAssetType | FlowAssetType
}

export async function sell(
	wallet: BlockchainWallet,
	itemApi: ItemControllerApi,
	ethSdk: RaribleSdk,
	request: PrepareSellRequest,
) {
	switch (wallet.blockchain) {//todo may be get blockchain from token id?
		case "ETHEREUM": {
			const item = await itemApi.getItemById({ itemId: request.itemId })
			const prepareSellResponse: PrepareSellResponse = {
				supportedCurrencies: [{ blockchain: "ETHEREUM", type: "NATIVE" }, {
					blockchain: "ETHEREUM",
					type: "ERC20",
				}],
				maxAmount: item.supply,
				baseFee: 10,//todo where we can get it?
			}

			const sellAction = Action
				.create({
					id: "sell" as const,
					run: async (sellReq: SellReq) => {
						const takeAssetType = getEthTakeAssetType(sellReq.currency)
						const sellRequest: SellRequest = {
							maker: toAddress(wallet.address),
							makeAssetType: {
								tokenId: toBigNumber(request.itemId),
								contract: toAddress(item.collection),
							},
							amount: parseInt(sellReq.amount),
							takeAssetType,
							price: sellReq.price,
							payouts: [], // todo
							originFees: [], // todo
						}
						return ethSdk.order.sell(sellRequest)
					},
				})
			return {
				...prepareSellResponse,
				submit: sellAction,
			}
		}
		case "FLOW": {
			const item = await itemApi.getItemById({ itemId: request.itemId })
			const prepareSellResponse: PrepareSellResponse = {
				supportedCurrencies: [{ blockchain: "FLOW", type: "NATIVE" }],
				maxAmount: item.supply,
				baseFee: 10,//todo where we can get it?
			}
			const sellAction = Action.create({ id: "sell" as const, run: () => Promise.resolve() })
			return {
				...prepareSellResponse,
				submit: sellAction,
			}
		}
		default: {
			throw new Error(`Unsupported: ${wallet.blockchain}`)
		}
	}
}

function getEthTakeAssetType(currency: EthEthereumAssetType | EthErc20AssetType | FlowAssetType) {
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




