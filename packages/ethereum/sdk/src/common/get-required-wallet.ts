import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { WalletIsUndefinedError } from "@rarible/sdk-common/build/errors"

export function getRequiredWallet(ethereum: Maybe<Ethereum>): Ethereum {
	if (!ethereum) throw new WalletIsUndefinedError()
	return ethereum
}
