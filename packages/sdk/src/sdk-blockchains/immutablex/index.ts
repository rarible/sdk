import type { Maybe } from "@rarible/types/build/maybe"
import type { ImmutableXWallet } from "@rarible/sdk-wallet"
import { createImxSdk } from "@rarible/immutable-sdk"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { LogsLevel } from "../../domain"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { getErrorHandlerMiddleware, NetworkErrorCode } from "../../common/apis"
import { ImxNftService } from "./nft"
import { ImxOrderService } from "./order"
import { ImxBalanceService } from "./balance"

export function createImmutablexSdk(
	wallet: Maybe<ImmutableXWallet>,
	apis: IApisSdk,
	env: ImxEnv,
	logsLevel?: LogsLevel
): IRaribleInternalSdk {
	const sdk = createImxSdk(wallet?.wallet.link, env, {
		apiClientParams: {
			middleware: [
				...(logsLevel !== LogsLevel.DISABLED
					? [getErrorHandlerMiddleware(NetworkErrorCode.IMX_NETWORK_ERR)]
					: []),
			],
		},
	})
	const nftService = new ImxNftService(sdk, apis)
	const orderService = new ImxOrderService(sdk, apis)
	const balancesService = new ImxBalanceService(sdk, apis)

	return {
		nft: {
			mint: notImplemented,
			burn: nftService.burn,
			transfer: nftService.transfer,
			generateTokenId: notImplemented,
			deploy: nonImplementedAction,
			createCollection: nonImplementedAction,
			preprocessMeta: notImplemented,
			uploadMeta: notImplemented,
		},
		order: {
			fill: orderService.buy,
			buy: orderService.buy,
			batchBuy: nonImplementedAction,
			acceptBid: notImplemented,
			sell: orderService.sell,
			sellUpdate: notImplemented,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: orderService.cancel,
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
