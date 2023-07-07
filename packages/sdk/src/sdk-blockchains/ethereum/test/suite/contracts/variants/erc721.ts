import type { EthErc721AssetType } from "@rarible/api-client"
import { createErc721Contract } from "@rarible/protocol-ethereum-sdk/build/order/contracts/erc721"
import { toBigNumber } from "@rarible/types"
import type { EVMSuiteSupportedBlockchain } from "../../domain"
import { EVMNonFungibleBase } from "./base"

export class ERC721Contract<T extends EVMSuiteSupportedBlockchain> extends EVMNonFungibleBase<T> {
    readonly contract = createErc721Contract(this.provider, this.addressEVM)

    getAsset = (tokenId: string): EthErc721AssetType => ({
    	"@type": "ERC721",
    	contract: this.contractAddress,
    	tokenId: toBigNumber(tokenId),
    })
}