import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { TezosNetwork } from "tezos-sdk-module/dist/common/base"
import type { IApisSdk, IRaribleInternalSdk } from "../../domain"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { TezosBid } from "./bid"
import { getMaybeTezosProvider, getTezosAPIs } from "./common"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"
import { TezosBurn } from "./burn"
import { TezosTokenId } from "./token-id"
import { TezosCancel } from "./cancel"
import { TezosBalance } from "./balance"
import { TezosDeploy } from "./deploy"
import { TezosCanTransfer } from "./restriction"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	network: TezosNetwork,
): IRaribleInternalSdk {
	const apis = getTezosAPIs(network)
	const maybeProvider = getMaybeTezosProvider(wallet?.provider, network)
	const sellService = new TezosSell(maybeProvider, apis)
	const mintService = new TezosMint(maybeProvider, apis, network)
	const bidService = new TezosBid(maybeProvider, apis)
	const fillService = new TezosFill(maybeProvider, apis, network)

	return {
		nft: {
			mint: mintService.mint,
			burn: new TezosBurn(maybeProvider, apis, network).burn,
			transfer: new TezosTransfer(maybeProvider, apis, network).transfer,
			generateTokenId: new TezosTokenId(maybeProvider, apis).generateTokenId,
			deploy: new TezosDeploy(maybeProvider, network).deployToken,
			preprocessMeta: mintService.preprocessMeta,
		},
		order: {
			fill: fillService.fill,
			buy: fillService.fill,
			acceptBid: fillService.fill,
			sell: sellService.sell,
			sellUpdate: sellService.update,
			bid: bidService.bid,
			bidUpdate: bidService.update,
			cancel: new TezosCancel(maybeProvider, apis, network).cancel,
		},
		balances: {
			getBalance: new TezosBalance(maybeProvider, apis).getBalance,
		},
		restriction: {
			canTransfer: new TezosCanTransfer(maybeProvider).canTransfer,
		},
	}
}
