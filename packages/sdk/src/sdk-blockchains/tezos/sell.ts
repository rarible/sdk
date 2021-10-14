import { SellRequest as TezosSellRequest, sell } from "tezos/sdk/order/sell"
// eslint-disable-next-line camelcase
import { Provider, get_public_key } from "tezos/sdk/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos/sdk/main"
import { Action } from "@rarible/action"
import { OrderPayout } from "@rarible/api-client"
import { toBigNumber, toOrderId } from "@rarible/types"
import { PrepareSellRequest, PrepareSellResponse, SellRequest, SellRequestCurrency } from "../../order/sell/domain"

export class Sell {
	constructor(
		private provider: Provider
	) {
		this.sell = this.sell.bind(this)
	}

	parseTakeAssetType(type: SellRequestCurrency) {
		switch (type["@type"]) {
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			case "FA_1_2": {
				return {
					asset_class: type["@type"],
					contract: type.contract,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	async getPayouts(requestPayouts?: OrderPayout[]) {
		let payouts = requestPayouts || []

		if (!Array.isArray(payouts) || payouts.length === 0) {
			return [{
				account: pk_to_pkh(await this.getMaker()),
				value: 10000n,
			}]
		}

		return payouts.map(p => ({
			account: pk_to_pkh(p.account),
			value: BigInt(p.value),
		})) || []
	}

	async getMaker(): Promise<string> {
		const maker = await get_public_key(this.provider)
		if (!maker) {
			throw new Error("Maker does not exist")
		}
		return maker
	}

	async sell(prepareSellRequest: PrepareSellRequest): Promise<PrepareSellResponse> {
		// const item = await this.sdk.apis.nftItem.getNftItemById({ itemId: request.itemId })
		const [contract, tokenId] = prepareSellRequest.itemId.split(":")
		const maker = await this.getMaker()

		const submit = Action.create({
			id: "approve" as const,
			run: async (request: SellRequest) => {
				const tezosRequest : TezosSellRequest = {
					maker,
					make_asset_type: {
						contract,
						token_id: BigInt(tokenId),
					},
					take_asset_type: this.parseTakeAssetType(request.currency),
					amount: BigInt(request.amount),
					price: BigInt(request.price),
					payouts: await this.getPayouts(request.payouts),
					origin_fees: request.originFees?.map(p => ({
						account: p.account,
						value: BigInt(p.value),
					})) || [],
				}

				return tezosRequest
			},
		})
			.thenStep({
				id: "sign" as const,
				run: async (sellRequest: TezosSellRequest) => {
					const result = await sell(this.provider, sellRequest)

					return toOrderId("0")
				},
			})

		return {
			maxAmount: toBigNumber("0"),
			supportedCurrencies: [{
				blockchain: "TEZOS",
				type: "NATIVE",
			}],
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit,
		}
	}
}
