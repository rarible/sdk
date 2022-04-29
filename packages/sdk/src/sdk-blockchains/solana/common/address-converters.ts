import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { ItemId, OrderId } from "@rarible/api-client"
import type { PublicKey } from "@solana/web3.js"
import { toPublicKey } from "@rarible/solana-common"

export function extractAddress(address: UnionAddress | ContractAddress | OrderId | ItemId | string): string {
	return address.slice(address.indexOf(":") + 1)
}

export function extractPublicKey(address: UnionAddress | ContractAddress | OrderId | ItemId | string): PublicKey {
	return toPublicKey(extractAddress(address))
}
