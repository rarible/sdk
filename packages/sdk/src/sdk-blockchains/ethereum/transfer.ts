import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import { convertToEthereumAddress, isEVMBlockchain } from "./common"

export class EthereumTransfer {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.transfer = this.transfer.bind(this)
		this.transferBasic = this.transferBasic.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {
		const [domain, contract, tokenId] = prepare.itemId.split(":")
		if (!isEVMBlockchain(domain)) {
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
						convertToEthereumAddress(request.to),
						amount
					)

					return new BlockchainEthereumTransaction(tx, this.network)
				},
			}),
		}
	}

	async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
		const response = await this.transfer(request)
		return response.submit(request)
	}
}
