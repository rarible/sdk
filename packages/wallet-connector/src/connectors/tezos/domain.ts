import type { TezosToolkit } from "@taquito/taquito"
import type { WalletProvider } from "@taquito/taquito/dist/types/wallet/interface"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"

export type TezosWallet = {
	toolkit: TezosToolkit
	wallet: WalletProvider
	address: string
	provider: TezosProvider
}