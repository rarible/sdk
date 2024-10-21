import type { EVMAddress, NftItemControllerApi } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import type { TransferAsset } from "./transfer"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export async function transferNftLazy(
  ethereum: Ethereum,
  send: SendFunction,
  nftItemApi: NftItemControllerApi,
  asset: TransferAsset,
  from: EVMAddress,
  to: EVMAddress,
  amount?: BigNumber,
): Promise<EthereumTransaction> {
  const lazyNft = await nftItemApi.getNftLazyItemById({
    itemId: `${asset.contract}:${asset.tokenId}`,
  })
  const params = {
    tokenId: lazyNft.tokenId,
    tokenURI: lazyNft.uri,
    creators: lazyNft.creators,
    royalties: lazyNft.royalties,
    signatures: lazyNft.signatures,
  }
  if (lazyNft["@type"] === "ERC1155") {
    ;(params as any).supply = lazyNft.supply
  }
  switch (lazyNft["@type"]) {
    case "ERC721": {
      const erc721Lazy = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, lazyNft.contract)
      return send(erc721Lazy.functionCall("transferFromOrMint", params, from, to))
    }
    case "ERC1155": {
      const erc1155Lazy = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, lazyNft.contract)
      return send(erc1155Lazy.functionCall("transferFromOrMint", params, from, to, amount))
    }
    default:
      return Promise.reject(new Error("Unsupported nft standard"))
  }
}
