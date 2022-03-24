import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet/src"
import { SolanaSdk } from "@rarible/solana-sdk"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction } from "../../common/not-implemented"
import { SolanaNft } from "./nft"
import { SolanaFill } from "./fill"
import { SolanaOrder } from "./order"
import { SolanaBalance } from "./balance"

export function createSolanaSdk(
	wallet: Maybe<SolanaWallet>,
	apis: IApisSdk,
	cluster: Cluster,
): IRaribleInternalSdk {
	const sdk = SolanaSdk.create({ connection: { cluster }, debug: true })
	const nftService = new SolanaNft(sdk, wallet, apis)
	const balanceService = new SolanaBalance(sdk, wallet)
	const orderService = new SolanaOrder(sdk, wallet, apis)
	const fillService = new SolanaFill(sdk, wallet, apis)

	return {
		nft: {
			mint: nftService.mint,
			burn: nftService.burn,
			transfer: nftService.transfer,
			generateTokenId: nonImplementedAction,
			deploy: nonImplementedAction,
			createCollection: nonImplementedAction,
			preprocessMeta: nonImplementedAction as any,
		},
		order: {
			fill: fillService.fill,
			buy: fillService.fill,
			acceptBid: fillService.fill,
			sell: orderService.sell,
			sellUpdate: orderService.sellUpdate,
			bid: orderService.bid,
			bidUpdate: orderService.bidUpdate,
			cancel: orderService.cancel,
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: nonImplementedAction,
		},
		restriction: {
			canTransfer: nonImplementedAction,
		},
	}
}
