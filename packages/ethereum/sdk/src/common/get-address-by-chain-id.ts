import type { EVMAddress, Address } from "@rarible/types"
import { toEVMAddress } from "@rarible/types"

export function getAddressByChainId(map: Record<number, Address | EVMAddress>, chainId: number): EVMAddress {
  const result = map[chainId]
  if (result != null) {
    return toEVMAddress(result)
  }
  throw new Error(`Not supported chainId: ${chainId}`)
}
