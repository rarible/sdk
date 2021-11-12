import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IRaribleInternalSdk } from "../../domain"
import type { IApisSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"
import { Bid } from "./bid"
import { getTezosAPIs } from "./common"
import type { TezosNetwork } from "./domain"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	network: TezosNetwork,
): IRaribleInternalSdk {
	const apis = getTezosAPIs(network)

	return {
		nft: {
			mint: notImplemented,
			burn: notImplemented,
			transfer: notImplemented,
			generateTokenId: notImplemented,
		},
		order: {
			fill: new Fill(wallet?.provider).fill,
			// @todo fix any type
			sell: new Sell(wallet?.provider, apis).sell as any,
			sellUpdate: notImplemented,
			bid: new Bid(wallet?.provider, apis).bid,
			bidUpdate: notImplemented,
			cancel: nonImplementedAction,
		},
		balances: {
			getBalance: notImplemented,
		},
	}
}
