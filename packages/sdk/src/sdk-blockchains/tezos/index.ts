import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { Blockchain } from "@rarible/api-client"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { Middlewarer } from "../../common/middleware/middleware"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import { MetaUploader } from "../union/meta/upload-meta"
import type { RaribleSdkConfig } from "../../config/domain"
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
	const createCollectionService = new TezosCreateCollection(maybeProvider, network)

	const preprocessMeta = Middlewarer.skipMiddleware(mintService.preprocessMeta)
	const metaUploader = new MetaUploader(Blockchain.TEZOS, preprocessMeta)

	return {
		nft: {
			mint: mintService.mint,
			burn: new TezosBurn(maybeProvider, _apis, network).burn,
			transfer: new TezosTransfer(maybeProvider, _apis, network).transfer,
			generateTokenId: new TezosTokenId(maybeProvider).generateTokenId,
			deploy: createCollectionService.createCollection,
			createCollection: createCollectionService.createCollection,
			preprocessMeta,
			uploadMeta: metaUploader.uploadMeta,
		},
		order: {
			fill: fillService.fill,
			buy: fillService.fill,
			acceptBid: fillService.fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: notImplemented,
			bidUpdate: notImplemented,
			cancel: new TezosCancel(maybeProvider, _apis, network).cancel,
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
