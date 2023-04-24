import { MethodWithPrepare } from "../types/common"
import type { IMint } from "../types/nft/mint"
import type { IRaribleInternalSdk } from "../domain"
import { getNonImplementedAction, getNotImplementedFn } from "./not-implemented"

export function createUnavailableBlockchain(msg?: string): IRaribleInternalSdk {
	const nonAvailableFn = getNotImplementedFn(msg)
	const nonAvailableAction = getNonImplementedAction(msg)
	return {
		nft: {
			mint: new MethodWithPrepare(nonAvailableFn, nonAvailableAction) as IMint,
			burn: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			transfer: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			generateTokenId: nonAvailableFn,
			createCollection: nonAvailableFn,
			preprocessMeta: nonAvailableFn,
			uploadMeta: nonAvailableFn,
		},
		order: {
			fill: { prepare: nonAvailableAction },
			sell: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			sellUpdate: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			buy: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			batchBuy: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			acceptBid: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			bid: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			bidUpdate: new MethodWithPrepare(nonAvailableFn, nonAvailableAction),
			cancel: nonAvailableFn,
		},
		balances: {
			getBalance: nonAvailableFn,
			convert: nonAvailableFn,
			transfer: nonAvailableFn,
			getBiddingBalance: nonAvailableAction,
			depositBiddingBalance: nonAvailableAction,
			withdrawBiddingBalance: nonAvailableAction,
		},
		restriction: {
			canTransfer: nonAvailableFn,
			getFutureOrderFees: nonAvailableFn,
		},
	}
}
