import type { TezosToolkit } from "@taquito/taquito"
import type { WalletProvider } from "@taquito/taquito/dist/types/wallet/interface"
import type { ProviderConnectionResult } from "@rarible/connector"

export interface TezosProviderConnectionResult<W extends WalletProvider = WalletProvider>
	extends ProviderConnectionResult {

	toolkit: TezosToolkit
	wallet: W
}