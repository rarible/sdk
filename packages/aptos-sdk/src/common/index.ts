import { toBn } from "@rarible/utils"
import type {
	WriteSetChange,
} from "@aptos-labs/ts-sdk"
import {
	Network,
} from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type {
	Account,
} from "@aptos-labs/ts-sdk"
import type { AptosWallet } from "@rarible/aptos-wallet"
import type { AptosSdkEnv } from "../domain"

export const APT_DIVIDER = toBn(10).pow(8)

export function isChangeBelongsToType(
	change: WriteSetChange, dataTypeFn: (dataType: string) => boolean
): boolean {
	return change.type === "write_resource" &&
    "data" in change && typeof change.data === "object" && change.data !== null &&
    "type" in change.data &&
    typeof change.data.type === "string" && dataTypeFn(change.data.type)
}

export function getNetworkFromEnv(env: AptosSdkEnv) {
	switch (env) {
		case "testnet": return Network.TESTNET
		case "mainnet": return Network.MAINNET
		default: throw new Error(`Network ${env} has not been recognized`)
	}
}

export function getRequiredWallet(wallet: Maybe<AptosWallet>): AptosWallet {
	if (!wallet) throw new Error("Aptos wallet doesn't exist")
	return wallet
}
