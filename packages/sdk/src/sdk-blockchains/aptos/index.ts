import { AptosSdk } from "@rarible/aptos-sdk"
import type { AptosWallet } from "@rarible/sdk-wallet"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/src/domain"
import type { AptosSdkConfig } from "@rarible/aptos-sdk/src/domain"
import type { Maybe } from "@rarible/types/build/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { GetFutureOrderFeeData } from "../../types/nft/restriction/domain"
import type { IApisSdk } from "../../domain"
import { MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import type { IRaribleInternalSdk } from "../../domain"
import { OriginFeeSupport } from "../../types/order/fill/domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { AptosNft } from "./nft"
import { AptosBalance } from "./balance"
import { AptosListing } from "./listing"
import { AptosCancel } from "./cancel"
import { AptosBid } from "./bid"

export function createAptosSdk(
	wallet: Maybe<AptosWallet>,
	apis: IApisSdk,
	env: AptosSdkEnv,
	config?: AptosSdkConfig,
): IRaribleInternalSdk {
	const sdk = new AptosSdk(wallet?.wallet, env, config)
	const nftService = new AptosNft(sdk, env, apis)
	const balanceService = new AptosBalance(sdk)
	const listingService = new AptosListing(sdk, env, apis)
	const bidService = new AptosBid(sdk, env, apis)
	const cancelService = new AptosCancel(sdk, env, apis)
	const preprocessMeta = Middlewarer.skipMiddleware(nftService.preprocessMeta)

	return {
		nft: {
			mint: new MethodWithPrepare(notImplemented, notImplemented),
			burn: new MethodWithPrepare(nftService.burnBasic, nftService.burn),
			transfer: new MethodWithPrepare(nftService.transferBasic, nftService.transfer),
			generateTokenId: notImplemented,
			createCollection: notImplemented,
			preprocessMeta,
			uploadMeta: notImplemented,
		},
		order: {
			fill: { prepare: notImplemented },
			buy: new MethodWithPrepare(listingService.buyBasic, listingService.buy),
			batchBuy: new MethodWithPrepare(notImplemented, notImplemented),
			acceptBid: new MethodWithPrepare(bidService.acceptBidBasic, bidService.acceptBid),
			sell: new MethodWithPrepare(listingService.sellBasic, listingService.sell),
			sellUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			bid: new MethodWithPrepare(bidService.bidBasic, bidService.bid),
			bidUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			cancel: cancelService.cancel,
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: notImplemented,
			transfer: notImplemented,
			getBiddingBalance: notImplemented,
			depositBiddingBalance: nonImplementedAction,
			withdrawBiddingBalance: nonImplementedAction,
		},
		restriction: {
			canTransfer: notImplemented,
			async getFutureOrderFees(): Promise<GetFutureOrderFeeData> {
				return {
					originFeeSupport: OriginFeeSupport.NONE,
					baseFee: 0,
				}
			},
		},
	}
}
