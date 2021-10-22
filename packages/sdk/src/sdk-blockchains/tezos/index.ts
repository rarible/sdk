import { TezosWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"

export function createTezosSdk(wallet: TezosWallet): IRaribleSdk {
	return {
		nft: {
			mint: null as any,
			burn: null as any,
			transfer: null as any,
		},
		order: {
			fill: new Fill(wallet.provider).fill,
			sell: new Sell(wallet.provider).sell,
			bid: null as any,
		},
	}
}
