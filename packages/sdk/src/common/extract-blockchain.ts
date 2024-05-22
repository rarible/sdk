import { Blockchain } from "@rarible/api-client"

/**
 * @todo this must be implemented in `@rarible/types` package
 */

export function toBlockchainGroup(blockchain: Blockchain): Blockchain {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
    case Blockchain.POLYGON:
      return Blockchain.ETHEREUM
    default:
      return blockchain
  }
}

export * from "@rarible/sdk-common/build/utils/address"
