import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleEthereumApis } from "@rarible/protocol-ethereum-sdk/build/common/apis"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import { checkWalletBlockchain, convertToEthereumAddress, getWalletNetwork, isEVMBlockchain } from "./common"

export class EthereumTransfer {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private getEthereumApis: () => Promise<RaribleEthereumApis>,
	) {
		this.transfer = this.transfer.bind(this)
		this.transferBasic = this.transferBasic.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {
		const [blockchain, contract, tokenId] = prepare.itemId.split(":")
		if (!isEVMBlockchain(blockchain)) {
			throw new Error(`Not an ethereum item: ${prepare.itemId}`)
		}

		const ethApi = await this.getEthereumApis()
		const item = await ethApi.nftItem.getNftItemById({
			itemId: `${contract}:${tokenId}`,
		})
		const collection = await ethApi.nftCollection.getNftCollectionById({
			collection: item.contract,
		})

		return {
			multiple: collection.type === "ERC1155",
			maxAmount: item.supply,
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: TransferRequest) => {
					await checkWalletBlockchain(this.wallet, blockchain)
					const amount = request.amount !== undefined ? toBigNumber(request.amount.toFixed()) : undefined

					const tx = await this.sdk.nft.transfer(
						{
						  contract: item.contract,
						  tokenId: item.tokenId,
					  },
						convertToEthereumAddress(request.to),
						amount
					)

					return new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
				},
			}),
		}
	}

	async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
		const response = await this.transfer(request)
		return response.submit(request)
	}
}
