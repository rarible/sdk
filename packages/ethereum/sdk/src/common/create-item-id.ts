import type { Address, BigNumber, ItemId, UnionAddress } from "@rarible/types"
import { toItemId } from "@rarible/types/build/item-id"
import { toUnionAddress } from "@rarible/types"
import { getUnionBlockchainFromChainId } from "./get-blockchain-from-chain-id"

export function createItemId(contract: Address, tokenId: BigNumber): string {
	return `${contract}:${tokenId}`
}
