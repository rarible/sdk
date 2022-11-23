import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"

export function getRequiredWallet(ethereum: Maybe<Ethereum>): Ethereum {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	return ethereum
}
