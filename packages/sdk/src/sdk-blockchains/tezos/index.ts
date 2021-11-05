import type { TezosWallet } from "@rarible/sdk-wallet"
import { Maybe } from "@rarible/protocol-ethereum-sdk/build/common/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IRaribleInternalSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"

export function createTezosSdk(wallet: Maybe<TezosWallet>): IRaribleInternalSdk {
	//todo allow creating tezos sdk without wallet
	return {
		nft: {
			mint: notImplemented,
			burn: notImplemented,
			transfer: notImplemented,
		},
		order: {
			fill: new Fill(wallet?.provider!).fill,
			// @todo fix typings
			sell: new Sell(wallet?.provider!).sell as any,
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
