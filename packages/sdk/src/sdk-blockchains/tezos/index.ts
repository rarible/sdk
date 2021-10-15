import { TezosWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../../domain"
import { createProvider } from "./providers"
import { Sell } from "./sell"
import { Fill } from "./fill"

export async function createTezosSdk(wallet: TezosWallet): Promise<IRaribleSdk> {
	const provider = await createProvider(wallet.network)

	return {
		nft: {
			mint: null as any,
		},
		order: {
			fill: new Fill(provider).fill,
			sell: new Sell(provider).sell,
		},
	}
}
