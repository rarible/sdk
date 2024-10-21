import type { Network } from "../domain"

export function normalizeAptosNetwork(network: string): Network {
  return (network.charAt(0).toUpperCase() + network.slice(1).toLowerCase()) as Network
}
