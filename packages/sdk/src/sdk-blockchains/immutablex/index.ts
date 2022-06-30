import type { IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"

export function createImmutablexSdkBlank(): IRaribleInternalSdk {
	return {
		nft: {
			mint: notImplemented,
			burn: notImplemented,
			transfer: notImplemented,
			generateTokenId: notImplemented,
			deploy: nonImplementedAction,
			createCollection: nonImplementedAction,
			preprocessMeta: notImplemented,
			uploadMeta: notImplemented,
		},
		order: {
			fill: notImplemented,
			buy: notImplemented,
			acceptBid: notImplemented,
			sell: notImplemented,
			sellUpdate: notImplemented,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: nonImplementedAction,
		},
		balances: {
			getBalance: notImplemented,
			convert: notImplemented,
			getBiddingBalance: nonImplementedAction,
			depositBiddingBalance: nonImplementedAction,
			withdrawBiddingBalance: nonImplementedAction,
		},
		restriction: {
			canTransfer: notImplemented,
		},
	}
}
