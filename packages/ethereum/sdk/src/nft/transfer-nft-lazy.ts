import type { UnionAddress, ItemControllerApi } from "@rarible/api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { getEVMItemIdData } from "@rarible/sdk-common/src"
import type { SendFunction } from "../common/send-transaction"
import { convertUnionPartsToEVM, createUnionItemId } from "../common/union-converters"
import type { TransferAsset } from "./transfer"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export async function transferNftLazy(
	ethereum: Ethereum,
	send: SendFunction,
	nftItemApi: ItemControllerApi,
	chainId: number,
	asset: TransferAsset,
	from: UnionAddress,
	to: UnionAddress,
	amount?: BigNumber
): Promise<EthereumTransaction> {
	const lazyNft = await nftItemApi.getLazyItemById({
		itemId: createUnionItemId(chainId, asset.contract, asset.tokenId),
	})
	const { tokenId, contract } = getEVMItemIdData(lazyNft.id)
	const params = {
		tokenId,
		tokenURI: lazyNft.uri,
		creators: convertUnionPartsToEVM(lazyNft.creators),
		royalties: convertUnionPartsToEVM(lazyNft.royalties),
		signatures: lazyNft.signatures,
	}
	if (lazyNft["@type"] === "ETH_ERC1155") {
		(params as any).supply = lazyNft.supply
	}
	switch (lazyNft["@type"]) {
		case "ETH_ERC721": {
			const erc721Lazy = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, contract)
			return send(erc721Lazy.functionCall("transferFromOrMint", params, from, to))
		}
		case "ETH_ERC1155": {
			const erc1155Lazy = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, contract)
			return send(erc1155Lazy.functionCall("transferFromOrMint", params, from, to, amount))
		}
		default: return Promise.reject(new Error("Unsupported nft standard"))
	}
}
