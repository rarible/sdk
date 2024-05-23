import type { EthErc1155AssetType } from "@rarible/api-client"
import { createErc1155Contract } from "@rarible/protocol-ethereum-sdk/build/order/contracts/erc1155"
import { toBigNumber } from "@rarible/types"
import type { EVMSuiteSupportedBlockchain } from "../../domain"
import { EVMNonFungibleBase } from "./base"

export class ERC1155Contract<T extends EVMSuiteSupportedBlockchain> extends EVMNonFungibleBase<T> {
  readonly contract = createErc1155Contract(this.provider, this.addressEVM)

  getAsset = (tokenId: string): EthErc1155AssetType => ({
    "@type": "ERC1155",
    contract: this.contractAddress,
    tokenId: toBigNumber(tokenId),
  })
}
