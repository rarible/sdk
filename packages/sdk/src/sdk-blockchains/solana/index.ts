import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction } from "../../common/not-implemented"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import type { ISolanaSdkConfig } from "./domain"
import { SolanaNft } from "./nft"
import { SolanaFill } from "./fill"
import { SolanaOrder } from "./order"
import { SolanaBalance } from "./balance"
import { SolanaCollection } from "./collection"

export function createSolanaSdk(
	wallet: Maybe<SolanaWallet>,
	apis: IApisSdk,
	cluster: Cluster,
	config: ISolanaSdkConfig | undefined
): IRaribleInternalSdk {
	const sdk = SolanaSdk.create({
		connection: {
			cluster,
			endpoint: config?.endpoint,
			commitmentOrConfig: "confirmed",
		},
		debug: false,
	})
	const nftService = new SolanaNft(sdk, wallet, apis, config)
	const balanceService = new SolanaBalance(sdk, wallet, apis, config)
	const orderService = new SolanaOrder(sdk, wallet, apis, config)
	const fillService = new SolanaFill(sdk, wallet, apis, config)
	const collectionService = new SolanaCollection(sdk, wallet, apis, config)

	const preprocessMeta = Middlewarer.skipMiddleware(nftService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.SOLANA, preprocessMeta)

	return {
		nft: {
			mint: nftService.mint,
			burn: nftService.burn,
			transfer: nftService.transfer,
			generateTokenId: nonImplementedAction,
			deploy: collectionService.createCollection,
			createCollection: collectionService.createCollection,
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
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
			getBiddingBalance: balanceService.getBiddingBalance,
			depositBiddingBalance: balanceService.depositBiddingBalance,
			withdrawBiddingBalance: balanceService.withdrawBiddingBalance,
		},
		restriction: {
			canTransfer: nonImplementedAction,
		},
	}
}
