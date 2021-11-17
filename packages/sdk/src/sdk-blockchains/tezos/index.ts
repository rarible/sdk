import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IRaribleInternalSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"

export function createTezosSdk(wallet: Maybe<TezosWallet>): IRaribleInternalSdk {
	return {
		nft: {
			mint: notImplemented,
			burn: notImplemented,
			transfer: notImplemented,
			generateTokenId: notImplemented,
			deploy: nonImplementedAction,
		},
		order: {
			fill: new Fill(wallet?.provider as any).fill as any,
			// @todo fix any type
			sell: new Sell(wallet?.provider as any).sell as any,
			sellUpdate: notImplemented,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: nonImplementedAction,
		},
		balances: {
			getBalance: notImplemented,
		},
	}
}
