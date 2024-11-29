import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { ItemId, OrderId } from "@rarible/api-client"
import type { PublicKey } from "@solana/web3.js"
import { toPublicKey } from "@rarible/solana-common"
import { extractId } from "@rarible/sdk-common"

export function extractPublicKey(address: UnionAddress | ContractAddress | OrderId | ItemId): PublicKey {
  return toPublicKey(extractId(address))
}
