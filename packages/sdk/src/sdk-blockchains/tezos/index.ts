import { TezosWallet } from "@rarible/sdk-wallet"
import { NftCollectionControllerApi } from "tezos-api-client"
import { NftItemControllerApi } from "tezos-api-client/build"
import { IRaribleInternalSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"
import { Bid } from "./bid"
import { getTezosAPIs } from "./common"

export function createTezosSdk(wallet: TezosWallet): IRaribleInternalSdk {
	const apis = getTezosAPIs()

	return {
		nft: {
			mint: null as any,
			burn: null as any,
			transfer: null as any,
		},
		order: {
			fill: new Fill(wallet.provider).fill,
			sell: new Sell(wallet.provider).sell as any, //todo FIX
			sellUpdate: null as any,
			bid: new Bid(wallet.provider, apis).bid,
			bidUpdate: null as any,
			cancel: null as any,
		},
	}
}
