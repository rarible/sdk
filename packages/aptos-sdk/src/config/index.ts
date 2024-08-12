import { Network as AptosNetwork } from "@aptos-labs/ts-sdk"
import type { SupportedNetwork } from "../domain"

export const CONFIG: Record<SupportedNetwork, AddressConfig> = {
  [AptosNetwork.TESTNET]: {
    marketplaceAddress: "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790",
    feeZeroScheduleAddress: "0xae22b0c0beee82ba654c2094c3bbf80706484978d2b5ba29620551a18a7e4b4c",
    raribleDropMachineAddress: "0xa0cb9758d3b0efb5fa76c4cccea8028b0fc6600226c46f7679d75566570bbf23",
  },
  [AptosNetwork.MAINNET]: {
    marketplaceAddress: "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790",
    feeZeroScheduleAddress: "",
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
