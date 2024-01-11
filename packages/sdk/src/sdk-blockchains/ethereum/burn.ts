import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleEthereumApis } from "@rarible/protocol-ethereum-sdk/build/common/apis"
import { extractBlockchain } from "@rarible/sdk-common"
import type { BurnRequest, PrepareBurnRequest } from "../../types/nft/burn/domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import type { BurnResponse } from "../../types/nft/burn/domain"
import { checkWalletBlockchain, getEthereumItemId, getWalletNetwork, toEthereumParts } from "./common"

export class EthereumBurn {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
		private getEthereumApis: () => Promise<RaribleEthereumApis>,
	) {
		this.burn = this.burn.bind(this)
		this.burnBasic = this.burnBasic.bind(this)
	}

	async burn(prepare: PrepareBurnRequest) {
		const { contract, tokenId } = getEthereumItemId(prepare.itemId)

		const blockchain = extractBlockchain(prepare.itemId)
		await checkWalletBlockchain(this.wallet, blockchain)

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
				id: "burn" as const,
				run: async (request: BurnRequest) => {
					await checkWalletBlockchain(this.wallet, blockchain)
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

					return tx && new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
				},
			}),
		}
	}

	async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
		const response = await this.burn(request)
		return response.submit(request)
	}
}
