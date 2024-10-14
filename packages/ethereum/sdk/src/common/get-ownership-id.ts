import type { EVMAddress } from "@rarible/ethereum-api-client"
import type { Address, BigNumber } from "@rarible/types"

export function getOwnershipId(
  contract: EVMAddress | Address,
  tokenId: BigNumber,
  owner: EVMAddress | Address,
): string {
  return `${contract}:${tokenId}:${owner}`
}
