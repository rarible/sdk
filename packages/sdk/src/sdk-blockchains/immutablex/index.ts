import type { IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"

export function createImmutablexSdkBlank(): IRaribleInternalSdk {
	return {
		nftBasic: {
			mint: notImplemented,
			transfer: notImplemented,
			burn: notImplemented,
			createCollection: notImplemented,
		},
		orderBasic: {
			sell: notImplemented,
			sellUpdate: notImplemented,
			buy: notImplemented,
			acceptBid: notImplemented,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: notImplemented,
		},
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
