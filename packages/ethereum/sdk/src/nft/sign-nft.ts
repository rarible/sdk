import type { Binary, LazyErc1155, LazyErc721 } from "@rarible/ethereum-api-client"
import type { Address, EVMAddress } from "@rarible/types"
import { toBinary } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { TypedMessage } from "eth-sig-util"
import type { Maybe } from "@rarible/types"
import type { GetConfigByChainId } from "../config"
import type { EIP712Domain } from "../types"
import {
  EIP1155_DOMAIN_NFT_TEMPLATE,
  EIP1155_NFT_TYPE,
  EIP1155_NFT_TYPES,
  EIP721_DOMAIN_NFT_TEMPLATE,
  EIP721_NFT_TYPE,
  EIP721_NFT_TYPES,
} from "./eip712"

export type SimpleLazyNft<K extends keyof any> = Omit<LazyErc721, K> | Omit<LazyErc1155, K>

export async function signNft(
  ethereum: Maybe<Ethereum>,
  getConfig: GetConfigByChainId,
  nft: SimpleLazyNft<"signatures">,
): Promise<Binary> {
  if (!ethereum) {
    throw new Error("Wallet undefined")
  }
  const config = await getConfig()
  switch (nft["@type"]) {
    case "ERC721": {
      const domain = createEIP712NftDomain(config.chainId, nft.contract, "ERC721")

      const data: TypedMessage<typeof EIP721_NFT_TYPES> = {
        types: EIP721_NFT_TYPES,
        domain,
        primaryType: EIP721_NFT_TYPE,
        message: {
          ...nft,
          tokenURI: nft.uri,
        },
      }
      const signedData = await ethereum.signTypedData(data)
      if (!signedData) {
        throw new Error(`signNft error: signedData is empty (${signedData}), data=${JSON.stringify(data)}`)
      }
      return toBinary(signedData)
    }
    case "ERC1155": {
      const domain = createEIP712NftDomain(config.chainId, nft.contract, "ERC1155")

      const data: TypedMessage<typeof EIP1155_NFT_TYPES> = {
        types: EIP1155_NFT_TYPES,
        domain,
        primaryType: EIP1155_NFT_TYPE,
        message: {
          ...nft,
          tokenURI: nft.uri,
        },
      }
      const signedData = await ethereum.signTypedData(data)
      if (!signedData) {
        throw new Error(`signNft error: signedData=${signedData}, data=${JSON.stringify(data)}`)
      }
      return toBinary(signedData)
    }
    default: {
      throw new Error("Unexpected")
    }
  }
}

function createEIP712NftDomain(
  chainId: number,
  verifyingContract: Address | EVMAddress,
  nftType: "ERC721" | "ERC1155",
): EIP712Domain {
  switch (nftType) {
    case "ERC721": {
      return {
        ...EIP721_DOMAIN_NFT_TEMPLATE,
        chainId,
        verifyingContract: verifyingContract,
      }
    }
    case "ERC1155": {
      return {
        ...EIP1155_DOMAIN_NFT_TEMPLATE,
        chainId,
        verifyingContract: verifyingContract,
      }
    }
    default: {
      throw new Error("Unexpected")
    }
  }
}
