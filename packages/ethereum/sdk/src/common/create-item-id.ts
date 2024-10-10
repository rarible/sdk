import type { Address, EVMAddress, BigNumber } from "@rarible/types"

export function createItemId(contract: Address | EVMAddress, tokenId: BigNumber): string {
  return `${contract}:${tokenId}`
}
