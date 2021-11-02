import { TezosWallet } from "@rarible/sdk-wallet"
import { NftCollectionControllerApi } from "tezos-api-client"
import { IRaribleInternalSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"

export function createTezosSdk(wallet: TezosWallet): IRaribleInternalSdk {
	// const apis = {
	// 	collection: new NftCollectionControllerApi(),
	//   item: new
	// }
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
			bid: null as any,
			bidUpdate: null as any,
			cancel: null as any,
		},
	}
}
