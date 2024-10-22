import type { Ethereum } from "@rarible/ethereum-provider"

export function prependProviderName(ethereum: Ethereum, test: string) {
  return `${ethereum.constructor.name}: ${test}`
}
