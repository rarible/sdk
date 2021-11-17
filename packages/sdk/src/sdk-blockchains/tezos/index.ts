import type { TezosWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import { nonImplementedAction, notImplemented } from "../../common/not-implemented"
import type { IRaribleInternalSdk } from "../../domain"
import type { IApisSdk } from "../../domain"
import { TezosSell } from "./sell"
import { TezosFill } from "./fill"
import { TezosBid } from "./bid"
import { getTezosAPIs } from "./common"
import type { TezosNetwork } from "./domain"
import { TezosMint } from "./mint"
import { TezosTransfer } from "./transfer"

export function createTezosSdk(
	wallet: Maybe<TezosWallet>,
	_apis: IApisSdk,
	network: TezosNetwork,
): IRaribleInternalSdk {
	const apis = getTezosAPIs(network)

	return {
		nft: {
			mint: new TezosMint(wallet?.provider, apis).mint,
			burn: notImplemented,
			transfer: new TezosTransfer(wallet?.provider, apis).transfer,
			generateTokenId: notImplemented,
			deploy: nonImplementedAction,
		},
		order: {
			fill: new TezosFill(wallet?.provider, apis).fill,
			// @todo fix any type
			sell: new TezosSell(wallet?.provider, apis).sell as any,
			sellUpdate: notImplemented,
			bid: new TezosBid(wallet?.provider, apis).bid,
			bidUpdate: notImplemented,
			cancel: nonImplementedAction,
		},
		balances: {
			getBalance: notImplemented,
		},
	}
}
