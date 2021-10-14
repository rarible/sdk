import { EthereumWallet } from "@rarible/sdk-wallet/src"
import { TezosWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../../domain"
import { createProvider } from "./providers"

export async function createTezosSdk(wallet: TezosWallet): Promise<IRaribleSdk> {
	const provider = await createProvider()


	return {
		nft: {
			mint: null as any,
		},
		order: {
			fill: null as any,
			sell: null as any,
		},
	}
}
