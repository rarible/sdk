import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { PrepareTransferRequest, TransferRequest } from "../../nft/transfer/domain"
import { convertUnionToEthereumAddress } from "./common"

export class Transfer {
	constructor(
		private sdk: RaribleSdk,
	) {
		this.transfer = this.transfer.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {
		const [domain, contract, tokenId] = prepare.itemId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error(`Not an ethereum item: ${prepare.itemId}`)
		}

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
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					const amount = request.amount !== undefined ? toBigNumber(request.amount.toFixed()) : undefined

					const tx = await this.sdk.nft.transfer(
						{
						  contract: item.contract,
						  tokenId: item.tokenId,
					  },
						convertUnionToEthereumAddress(request.to),
						amount
					)

					return new BlockchainEthereumTransaction(tx)
				},
			}),
		}
	}
}
