import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IRaribleInternalSdk } from "../../domain"
import type { IApisSdk } from "../../domain"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { TezosBid } from "./bid"
import { getMaybeTezosProvider, getTezosAPIs } from "./common"
import type { TezosNetwork } from "./domain"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"
import { TezosBurn } from "./burn"
import { TezosTokenId } from "./token-id"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	network: TezosNetwork,
): IRaribleInternalSdk {
	const apis = getTezosAPIs(network)
	const maybeProvider = getMaybeTezosProvider(wallet?.provider, network)

	return {
		nft: {
			mint: new TezosMint(maybeProvider, apis).mint,
			burn: new TezosBurn(maybeProvider, apis).burn,
			transfer: new TezosTransfer(maybeProvider, apis).transfer,
			generateTokenId: new TezosTokenId(maybeProvider, apis).generateTokenId,
			deploy: nonImplementedAction,
		},
		order: {
			fill: new TezosFill(maybeProvider, apis).fill,
			sell: new TezosSell(maybeProvider, apis).sell,
			sellUpdate: notImplemented,
			bid: new TezosBid(maybeProvider, apis).bid,
			bidUpdate: notImplemented,
			cancel: nonImplementedAction,
		},
		balances: {
			getBalance: notImplemented,
		},
	}
}
