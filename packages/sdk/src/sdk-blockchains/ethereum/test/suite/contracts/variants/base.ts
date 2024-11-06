import type { EthereumContract } from "@rarible/ethereum-provider/build"
import { toEVMAddress, toCollectionId, toUnionContractAddress } from "@rarible/types"
import type { EVMSuiteProvider, EVMSuiteSupportedBlockchain } from "../../domain"

export abstract class EVMAddressful<T extends EVMSuiteSupportedBlockchain> {
  readonly addressEVM = toEVMAddress(this.addressString)
  readonly contractAddress = toUnionContractAddress(`${this.blockchain}:${this.addressString}`)

  constructor(
    public readonly blockchain: T,
    public readonly addressString: string,
    readonly provider: EVMSuiteProvider<T>,
  ) {}
}

export abstract class EVMContractBase<T extends EVMSuiteSupportedBlockchain> extends EVMAddressful<T> {
  abstract readonly contract: EthereumContract
}

export abstract class EVMNonFungibleBase<T extends EVMSuiteSupportedBlockchain> extends EVMContractBase<T> {
  readonly collectionId = toCollectionId(this.contractAddress)
}
