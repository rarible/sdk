import type { Maybe } from "@rarible/types/build/maybe"
import type { ImmutableXWallet } from "@rarible/sdk-wallet"
import { createImxSdk } from "@rarible/immutable-sdk"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IApisSdk } from "../../domain"
import { MethodWithPrepare } from "../../types/common"
import { getErrorHandlerMiddleware, NetworkErrorCode } from "../../common/apis"
import { ImxNftService } from "./nft"
import { ImxOrderService } from "./order"
import { ImxBalanceService } from "./balance"

export function createImmutablexSdk(
	wallet: Maybe<ImmutableXWallet>,
	apis: IApisSdk,
	env: ImxEnv,
): IRaribleInternalSdk {
	const sdk = createImxSdk(wallet?.wallet.link, env, {
		apiClientParams: {
			middleware: [
				getErrorHandlerMiddleware(NetworkErrorCode.IMX_NETWORK_ERR),
			],
		},
	})
	const nftService = new ImxNftService(sdk, apis)
	const orderService = new ImxOrderService(sdk, apis)
	const balancesService = new ImxBalanceService(sdk, apis)

	return {
		nft: {
			mint: new MethodWithPrepare(notImplemented, notImplemented),
			burn: new MethodWithPrepare(nftService.burnBasic, nftService.burn),
			transfer: new MethodWithPrepare(nftService.transferBasic, nftService.transfer),
			generateTokenId: notImplemented,
			createCollection: nonImplementedAction,
			preprocessMeta: notImplemented,
			uploadMeta: notImplemented,
		},
		order: {
			fill: { prepare: orderService.buy },
			buy: new MethodWithPrepare(orderService.buyBasic, orderService.buy),
			batchBuy: new MethodWithPrepare(notImplemented, nonImplementedAction),
			acceptBid: new MethodWithPrepare(orderService.acceptBidBasic, orderService.buy),
			sell: new MethodWithPrepare(orderService.sellBasic, orderService.sell),
			sellUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			bid: new MethodWithPrepare(notImplemented, notImplemented),
			bidUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			cancel: orderService.cancelBasic,
		},
		balances: {
			getBalance: balancesService.getBalance,
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
