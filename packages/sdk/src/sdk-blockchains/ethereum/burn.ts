import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { BurnRequest, PrepareBurnRequest } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest, BurnSimplifiedResponse } from "../../types/nft/burn/simplified"
import { getEthereumItemId, isEVMBlockchain, toEthereumParts } from "./common"

export class EthereumBurn {
	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.burn = this.burn.bind(this)
	}

	async burn(prepare: PrepareBurnRequest) {
		const { domain, contract, tokenId } = getEthereumItemId(prepare.itemId)

		const item = await this.sdk.apis.nftItem.getNftItemById({
			itemId: `${contract}:${tokenId}`,
		})
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: item.contract,
		})

		return {
			multiple: collection.type === "ERC1155",
			maxAmount: item.supply,
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					const amount = request?.amount !== undefined ? toBigNumber(request.amount.toFixed()) : undefined

					const tx = await this.sdk.nft.burn(
						{
							assetType: {
								contract: item.contract,
								tokenId: item.tokenId,
							},
						  amount,
							creators: toEthereumParts(request?.creators),
						},
					)

					return tx && new BlockchainEthereumTransaction(tx, this.network)
				},
			}),
		}
	}

	async burnSimplified(request: BurnSimplifiedRequest): Promise<BurnSimplifiedResponse> {

	}
}
