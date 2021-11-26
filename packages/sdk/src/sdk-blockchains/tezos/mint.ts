import type { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { get_address, mint } from "tezos-sdk-module"
import type { NftCollectionControllerApi } from "tezos-api-client/build"
import BigNumber from "bignumber.js"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type { ContractAddress } from "@rarible/types"
import { toItemId } from "@rarible/types"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type { PrepareMintResponse } from "../../types/nft/mint/domain"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { HasCollection, HasCollectionId } from "../../types/nft/mint/prepare-mint-request.type"
import { MintType } from "../../types/nft/mint/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import { getRequiredProvider, getTezosAddress, isExistedTezosProvider } from "./common"

export class TezosMint {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.mint = this.mint.bind(this)
	}

	getCreators(request: MintRequest): string | undefined {
		const [owner] = request.creators || []
		return owner?.account ? getTezosAddress(owner?.account) : undefined
	}

	async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const { contract, owner, type } = await getCollectionData(this.apis.collection, prepareRequest)

		return {
			multiple: type === "MT",
			supportsRoyalties: true,
			supportsLazyMint: false,
			submit: Action.create({
				id: "mint" as const,
				run: async (request: MintRequest) => {
					const royalties = request.royalties?.reduce((acc, royalty) => {
						const account = getTezosAddress(royalty.account)
						acc[account] = new BigNumber(royalty.value)
						return acc
					}, {} as {[key: string]: BigNumber}) || {}

					const supply = type === "NFT" ? undefined : toBn(request.supply)

					const provider = getRequiredProvider(this.provider)

					const result = await mint(
						getRequiredProvider(this.provider),
						contract,
						royalties,
						supply,
						prepareRequest.tokenId ? toBn(prepareRequest.tokenId.tokenId) : undefined,
						{
							"": request.uri,
						},
						await get_address(provider),
					)

					return {
						type: MintType.ON_CHAIN,
						transaction: new BlockchainTezosTransaction(result),
						itemId: toItemId(`TEZOS:${contract}:${result.token_id}`),
					}
				},
			}),
		}
	}
}

export async function getCollectionData(
	api: NftCollectionControllerApi,
	prepareRequest: HasCollection | HasCollectionId,
): Promise<{contract: string, owner?: string, type: "NFT" | "MT" }> {
	const contractAddress = getContractFromRequest(prepareRequest)
	const [blockchain, contract] = contractAddress.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
	}
	const collection = await api.getNftCollectionById({
		collection: contract,
	})
	if (!collection) {
		throw new Error(`Tezos collection with address=${contract} has not been found`)
	}
	return {
		contract,
		owner: collection.owner,
		type: collection.type,
	}
}

export function getContractFromRequest(request: HasCollection | HasCollectionId): ContractAddress {
	if ("collection" in request) {
		return request.collection.id
	} else if ("collectionId" in request) {
		return request.collectionId
	} else {
		throw new Error("Wrong request: collection or collectionId has not been found")
	}
}
