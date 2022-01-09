import type { TezosToolkit } from "@taquito/taquito"
import type { WalletProvider } from "@taquito/taquito/dist/types/wallet/interface"
import type { ProviderConnectionResult, Blockchain } from "@rarible/connector/src/common/provider-wallet"

export interface TezosProviderConnectionResult extends ProviderConnectionResult {
	blockchain: Blockchain.TEZOS
	toolkit: TezosToolkit
	wallet: WalletProvider
}