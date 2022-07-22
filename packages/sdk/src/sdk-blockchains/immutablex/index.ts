import type { IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { SimplifiedWithActionClass, SimplifiedWithPrepareClass } from "../../types/common"

export function createImmutablexSdkBlank(): IRaribleInternalSdk {
	return {
		nft: {
			mint: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			burn: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			transfer: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			generateTokenId: notImplemented,
			deploy: new SimplifiedWithActionClass(notImplemented, nonImplementedAction),
			createCollection: new SimplifiedWithActionClass(notImplemented, nonImplementedAction),
			preprocessMeta: notImplemented,
			uploadMeta: notImplemented,
		},
		order: {
			fill: { prepare: notImplemented },
			buy: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			acceptBid: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			sell: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			sellUpdate: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			bid: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			bidUpdate: new SimplifiedWithPrepareClass(notImplemented, notImplemented),
			cancel: new SimplifiedWithActionClass(notImplemented, nonImplementedAction),
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
