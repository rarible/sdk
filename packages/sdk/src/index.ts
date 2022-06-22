import type { Ethereum } from "@rarible/ethereum-provider"
import type { SolanaWalletProvider } from "@rarible/solana-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "@rarible/sdk-wallet"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { Fcl } from "@rarible/fcl-types"
import { isBlockchainWallet } from "@rarible/sdk-wallet"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IMintAndSell, MintAndSellRequest, MintAndSellResponse } from "./types/nft/mint-and-sell/domain"
import type { IRaribleSdk, IRaribleSdkConfig } from "./domain"
import type { RaribleSdkEnvironment } from "./config/domain"
import { internalCreateRaribleSdk } from "./sdk-constructor"


/*
export { getSimpleFlowFungibleBalance } from "./sdk-blockchains/flow/balance-simple"

export { UnionPart } from "./types/order/common/index"
export { isEVMBlockchain } from "./sdk-blockchains/ethereum/common"
*/

export { IRaribleSdk, MintAndSellRequest }
export { RequestCurrency } from "./common/domain"

export function createRaribleSdk(
	provider: RaribleSdkProvider | undefined,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
): IRaribleSdk {
	const wallet = provider && getRaribleWallet(provider)
	return internalCreateRaribleSdk(wallet, env, config)
}

type BlockchainProvider = Ethereum | SolanaWalletProvider | TezosProvider | Fcl
type RaribleSdkProvider = BlockchainWallet | BlockchainProvider

function getRaribleWallet(provider: RaribleSdkProvider): BlockchainWallet {
	if (isBlockchainWallet(provider)) {
		return provider
	}

	if (isEthereumProvider(provider)) return new EthereumWallet(provider)
	if (isSolanaProvider(provider)) return new SolanaWallet(provider)
	if (isTezosProvider(provider)) return new TezosWallet(provider)
	if (isFlowProvider(provider)) return new FlowWallet(provider)

	throw new Error("Unsupported provider")
}

function isEthereumProvider(x: any): x is Ethereum {
	return "personalSign" in x
}

function isSolanaProvider(x: any): x is SolanaWalletProvider {
	return "signTransaction" in x
}

function isTezosProvider(x: any): x is TezosProvider {
	return "sign" in x && "kind" in x
}

function isFlowProvider(x: any): x is Fcl {
	return "authz" in x
}
