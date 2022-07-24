import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { MetaUploader } from "../union/meta/upload-meta"
import type { RaribleSdkConfig } from "../../config/domain"
import { MethodWithAction, MethodWithPrepare } from "../../types/common"
import type { IMint } from "../../types/nft/mint"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { getMaybeTezosProvider } from "./common"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"
import { TezosBurn } from "./burn"
import { TezosTokenId } from "./token-id"
import { TezosCancel } from "./cancel"
import { TezosBalance } from "./balance"
import { TezosCreateCollection } from "./create-collection"
import { TezosCanTransfer } from "./restriction"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	config: RaribleSdkConfig,
): IRaribleInternalSdk {
	const network = config.tezosNetwork
	const maybeProvider = getMaybeTezosProvider(wallet?.provider, network, config)
	const sellService = new TezosSell(maybeProvider, _apis)
	const mintService = new TezosMint(maybeProvider, _apis, network)
	const balanceService = new TezosBalance(maybeProvider, network)
	const fillService = new TezosFill(maybeProvider, _apis, network)
	const { createCollectionSimplified, createCollection } = new TezosCreateCollection(maybeProvider, network)
	const transferService = new TezosTransfer(maybeProvider, _apis, network)
	const burnService = new TezosBurn(maybeProvider, _apis, network)
	const cancelService = new TezosCancel(maybeProvider, _apis, network)

	const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.TEZOS, preprocessMeta)

	return {
		nft: {
			mint: new MethodWithPrepare(mintService.mintBasic, mintService.mint) as IMint,
			burn: new MethodWithPrepare(burnService.burnBasic, burnService.burn),
			transfer: new MethodWithPrepare(transferService.transferBasic, transferService.transfer),
			generateTokenId: new TezosTokenId(maybeProvider).generateTokenId,
			deploy: new MethodWithAction(createCollectionSimplified, createCollection),
			createCollection: new MethodWithAction(createCollectionSimplified, createCollection),
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			fill: { prepare: fillService.fill },
			buy: new MethodWithPrepare(fillService.buyBasic, fillService.fill),
			acceptBid: new MethodWithPrepare(fillService.acceptBidBasic, fillService.fill),
			sell: new MethodWithPrepare(sellService.sellBasic, sellService.sell),
			sellUpdate: new MethodWithPrepare(sellService.sellUpdateBasic, sellService.update),
			bid: new MethodWithPrepare(notImplemented, nonImplementedAction),
			bidUpdate: new MethodWithPrepare(notImplemented, nonImplementedAction),
			cancel: new MethodWithAction(cancelService.cancelBasic, cancelService.cancel),
		},
		balances: {
			getBalance: balanceService.getBalance,
			convert: notImplemented,
			getBiddingBalance: nonImplementedAction,
			depositBiddingBalance: nonImplementedAction,
			withdrawBiddingBalance: nonImplementedAction,
		},
		restriction: {
			canTransfer: new TezosCanTransfer(maybeProvider).canTransfer,
		},
	}
}
