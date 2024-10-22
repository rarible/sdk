import type { Address, EVMAddress } from "@rarible/types"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider/build"
import { ERC1155VersionEnum } from "../domain"

export async function getErc1155Contract(
  ethereum: Ethereum,
  version: ERC1155VersionEnum,
  address: Address | EVMAddress | undefined,
): Promise<EthereumContract> {
  switch (version) {
    case ERC1155VersionEnum.ERC1155V2: {
      const { erc1155v2Abi } = await import("./v2")
      return ethereum.createContract(erc1155v2Abi, address)
    }
    case ERC1155VersionEnum.ERC1155V1: {
      const { erc1155v1Abi } = await import("./v1")
      return ethereum.createContract(erc1155v1Abi, address)
    }
    default:
      throw new Error("Unsupported ERC1155 version")
  }
}
