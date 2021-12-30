import type { TezosToolkit } from "@taquito/taquito"
import type { WalletProvider } from "@taquito/taquito/dist/types/wallet/interface"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { ProviderConnectionResult, Blockchain } from "../../common/provider-wallet"

export interface TezosProviderConnectionResult extends ProviderConnectionResult {
	blockchain: Blockchain.TEZOS
	toolkit: TezosToolkit
	wallet: WalletProvider
	provider: TezosProvider
}