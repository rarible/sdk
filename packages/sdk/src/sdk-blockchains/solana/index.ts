import type { Cluster } from "@solana/web3.js"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { nonImplementedAction } from "../../common/not-implemented"
import { Middlewarer } from "../../common/middleware/middleware"
import { MetaUploader } from "../union/meta/upload-meta"
import { SimplifiedWithActionClass, SimplifiedWithPrepareClass } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
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
	const { createCollectionBasic, createCollection } = new SolanaCollection(sdk, wallet, apis, config)

	const preprocessMeta = Middlewarer.skipMiddleware(nftService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.SOLANA, preprocessMeta)

	return {
		nft: {
			mint: new SimplifiedWithPrepareClass(nftService.mintBasic, nftService.mint) as IMint,
			burn: new SimplifiedWithPrepareClass(nftService.burnBasic, nftService.burn),
			transfer: new SimplifiedWithPrepareClass(nftService.transferBasic, nftService.transfer),
			generateTokenId: nonImplementedAction,
			deploy: new SimplifiedWithActionClass(createCollectionBasic, createCollection),
			createCollection: new SimplifiedWithActionClass(createCollectionBasic, createCollection),
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			fill: { prepare: fillService.fill },
			buy: new SimplifiedWithPrepareClass(fillService.buyBasic, fillService.fill),
			acceptBid: new SimplifiedWithPrepareClass(fillService.acceptBidBasic, fillService.fill),
			sell: new SimplifiedWithPrepareClass(orderService.sellBasic, orderService.sell),
			sellUpdate: new SimplifiedWithPrepareClass(orderService.sellUpdateBasic, orderService.sellUpdate),
			bid: new SimplifiedWithPrepareClass(orderService.bidBasic, orderService.bid),
			bidUpdate: new SimplifiedWithPrepareClass(orderService.bidUpdateBasic, orderService.bidUpdate),
			cancel: new SimplifiedWithActionClass(orderService.cancelBasic, orderService.cancel),
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
