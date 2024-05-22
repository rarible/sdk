import { toAddress } from "@rarible/types"

export function parseItemId(itemId: string) {
  const split = itemId.split(":")
  if (split.length < 2) {
    throw new Error(`Unable to parse ItemId: ${itemId}`)
  }
  const [contract, tokenId] = split
  return { contract: toAddress(contract), tokenId }
}
