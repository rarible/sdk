import { Network as AptosNetwork } from "@aptos-labs/ts-sdk"
import type { SupportedNetwork } from "../domain"

export const CONFIG: Record<SupportedNetwork, AddressConfig> = {
  [AptosNetwork.TESTNET]: {
    marketplaceAddress: "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790",
    feeZeroScheduleAddress: "0x068af5ce57d7fbe56ec28b19c72cc47c4c43b8be313c7b7f241408d2ca1c3ed1",
    raribleDropMachineAddress: "0xa0cb9758d3b0efb5fa76c4cccea8028b0fc6600226c46f7679d75566570bbf23",
  },
  [AptosNetwork.MAINNET]: {
    marketplaceAddress: "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790",
    feeZeroScheduleAddress: "0x068af5ce57d7fbe56ec28b19c72cc47c4c43b8be313c7b7f241408d2ca1c3ed1",
    raribleDropMachineAddress: "0xa0cb9758d3b0efb5fa76c4cccea8028b0fc6600226c46f7679d75566570bbf23",
  },
}

export type AddressConfig = {
  marketplaceAddress: string
  feeZeroScheduleAddress: string
  raribleDropMachineAddress: string
}

export function getEnvConfig(network: SupportedNetwork): AddressConfig {
  if (!CONFIG[network]) throw new Error(`Config for network=${network} doesn't exist`)
  return CONFIG[network]
}
