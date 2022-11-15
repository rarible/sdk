import type { Address } from "@rarible/ethereum-api-client"

export function getAddressByChainId(map: Record<number, Address>, chainId: number): Address {
	const result = map[chainId]
	if (result != null) {
		return result
	}
	throw new Error(`Not supported chainId: ${chainId}`)
}
