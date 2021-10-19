import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toAddress, toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { PrepareTransferRequest, TransferRequest } from "../../nft/transfer/domain"

export class Transfer {
	constructor(
		private sdk: RaribleSdk,
	) {
		this.transfer = this.transfer.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {

		const item = await this.sdk.apis.nftItem.getNftItemById({
			itemId: prepare.itemId,
		})
		const contract = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: item.contract,
		})

		return {
			multiple: contract.type === "ERC1155",
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
						toAddress(request.to),
						amount
					)

					return new BlockchainEthereumTransaction(tx)
				},
			}),
		}
	}
}
