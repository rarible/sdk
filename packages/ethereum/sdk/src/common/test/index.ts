import type { ContractAddress, ItemId } from "@rarible/types"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client/build/models/Blockchain"
import type { UnionAddress } from "@rarible/api-client"
import { toItemId } from "@rarible/types/build/item-id"
import { createEthereumApis } from "../apis"
import type { EthereumNetwork } from "../../types"
import { getAPIKey } from "../balances.test"

export function getEthUnionAddr(addr: string): UnionAddress {
	return toUnionAddress(`${Blockchain.ETHEREUM}:${addr}`)
}

export function getEthContractAddress(addr: string): ContractAddress {
	return toContractAddress(`${Blockchain.ETHEREUM}:${addr}`)
}

export function getEthUnionItemId(contract: string, tokenId: string): ItemId {
	return toItemId(`${Blockchain.ETHEREUM}:${contract}:${tokenId}`)
}

export function getTestApis(
	env: EthereumNetwork,
) {
	return createEthereumApis(env, { apiKey: getAPIKey(env) })
}
