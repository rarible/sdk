import { Network as AptosNetwork } from "@aptos-labs/ts-sdk"
import type { SupportedNetwork } from "../domain"

export const CONFIG: Record<SupportedNetwork, AddressConfig> = {
  [AptosNetwork.TESTNET]: {
    marketplaceAddress: "0x8d67f2ffcb48820474a71dbb128396bbfbb401fdf7b91d2b07d1a7479ccbdfee",
    feeZeroScheduleAddress: "0xbfb0d6a55cb0839c55bcde77c2852b700d64b3afd00ac8e319679cb31bf99063",
    raribleDropMachineAddress: "0xba7191af5b1435ccd7a7ee925650b1a0a58f57db4e28345ce48bf12c40b71126",
  },
  [AptosNetwork.MAINNET]: {
    marketplaceAddress: "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790",
    feeZeroScheduleAddress: "0x9db2c77084b1507acb9cb7d16350598b1e9db1cc61ecba1b017c467398d13f03",
    raribleDropMachineAddress: "",
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
