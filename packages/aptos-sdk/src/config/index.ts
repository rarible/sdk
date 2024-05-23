import { Network } from "@aptos-labs/ts-sdk"

export const CONFIG: Record<string, AddressConfig> = {
	[Network.TESTNET]: {
		marketplaceAddress: "0x8d67f2ffcb48820474a71dbb128396bbfbb401fdf7b91d2b07d1a7479ccbdfee",
		feeZeroScheduleAddress: "0xbfb0d6a55cb0839c55bcde77c2852b700d64b3afd00ac8e319679cb31bf99063",
		raribleDropMachineAddress: "0xba7191af5b1435ccd7a7ee925650b1a0a58f57db4e28345ce48bf12c40b71126",
	},
}

export type AddressConfig = {
	marketplaceAddress: string
	feeZeroScheduleAddress: string
	raribleDropMachineAddress: string
}

export function getEnvConfig(network: Network): AddressConfig {
	if (!CONFIG[network]) throw new Error(`Config for network=${network} doesn't exist`)
	return CONFIG[network]
}
