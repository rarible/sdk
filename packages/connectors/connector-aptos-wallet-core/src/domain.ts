import type { Network } from "@aptos-labs/ts-sdk"
import type { WalletCore } from "@aptos-labs/wallet-adapter-core"

export interface AptosWalletCoreConnectionResult {
  provider: WalletCore
  network: Network
  address: string
  disconnect?: () => void
}

export { Network }
