import type Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { SolanaWalletProvider } from "@rarible/solana-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "@rarible/sdk-wallet"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { Fcl } from "@rarible/fcl-types"
import { isBlockchainWallet } from "@rarible/sdk-wallet"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { MintAndSellRequest } from "./types/nft/mint-and-sell/domain"
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

export type BlockchainProvider = Ethereum | SolanaWalletProvider | TezosProvider | Fcl
export type RaribleSdkProvider = BlockchainWallet | BlockchainProvider

function getRaribleWallet(provider: RaribleSdkProvider): BlockchainWallet {
	if (isBlockchainWallet(provider)) {
		return provider
	}

	if (isEthereumProvider(provider)) return new EthereumWallet(provider)
	if (isSolanaProvider(provider)) return new SolanaWallet(provider)
	if (isTezosProvider(provider)) return new TezosWallet(provider)
	if (isFlowProvider(provider)) return new FlowWallet(provider)

	if (isWeb3(provider)) {
		return new EthereumWallet(new Web3Ethereum({ web3: provider }))
	}

	throw new Error("Unsupported provider")
}

function isEthereumProvider(x: any): x is Ethereum {
	return "personalSign" in x && "getFrom" in x && "getChainId" in x
}

function isSolanaProvider(x: any): x is SolanaWalletProvider {
	return "signTransaction" in x && "publicKey" in x
}

function isTezosProvider(x: any): x is TezosProvider {
	return "sign" in x && "kind" in x && "public_key" in x
}

function isFlowProvider(x: any): x is Fcl {
	return "authz" in x && "send" in x && "currentUser" in x
}

function isWeb3(x: any): x is Web3 {
	return "eth" in x && "utils" in x && "signTransaction" in x.eth && "getChainId" in x.eth
}
