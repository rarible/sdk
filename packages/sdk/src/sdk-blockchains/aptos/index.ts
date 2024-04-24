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
import { AptosNft } from "./nft"
import { AptosBalance } from "./balance"

export function createAptosSdk(
	wallet: Maybe<AptosWallet>,
	apis: IApisSdk,
	env: AptosSdkEnv,
	config?: AptosSdkConfig,
): IRaribleInternalSdk {
	const sdk = new AptosSdk(wallet?.wallet, env, config)
	const nftService = new AptosNft(sdk, env, apis)
	const balanceService = new AptosBalance(sdk)

	return {
		nft: {
			mint: new MethodWithPrepare(nftService.mintBasic, nftService.mint) as IMint,
			burn: new MethodWithPrepare(nftService.burnBasic, nftService.burn),
			transfer: new MethodWithPrepare(nftService.transferBasic, nftService.transfer),
			generateTokenId: notImplemented,
			createCollection: nftService.createCollectionBasic,
			preprocessMeta: notImplemented,
			uploadMeta: notImplemented,
		},
		order: {
			fill: { prepare: notImplemented },
			buy: new MethodWithPrepare(notImplemented, notImplemented),
			batchBuy: new MethodWithPrepare(notImplemented, notImplemented),
			acceptBid: new MethodWithPrepare(notImplemented, notImplemented),
			sell: new MethodWithPrepare(notImplemented, notImplemented),
			sellUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			bid: new MethodWithPrepare(notImplemented, notImplemented),
			bidUpdate: new MethodWithPrepare(notImplemented, notImplemented),
			cancel: notImplemented,
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
