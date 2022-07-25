import type Web3 from "web3"
import type { TypedDataSigner, Signer } from "@ethersproject/abstract-signer"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Ethereum } from "@rarible/ethereum-provider"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import type { SolanaWalletProvider } from "@rarible/solana-wallet"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { Fcl } from "@rarible/fcl-types"
import { EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "./"
import type { BlockchainWallet } from "./"
import { isBlockchainWallet } from "./"

export type BlockchainProvider = Ethereum | SolanaWalletProvider | TezosProvider | Fcl
type EtherSigner = TypedDataSigner & Signer
export type EthereumProvider = Web3 | EtherSigner
export type RaribleSdkProvider = BlockchainWallet | BlockchainProvider | EthereumProvider

export function getRaribleWallet(provider: RaribleSdkProvider): BlockchainWallet {
	if (isBlockchainWallet(provider)) {
		return provider
	}

	if (isEthereumProvider(provider)) return new EthereumWallet(provider)
	if (isSolanaProvider(provider)) return new SolanaWallet(provider)
	if (isTezosProvider(provider)) return new TezosWallet(provider)
	if (isFlowProvider(provider)) return new FlowWallet(provider)

	if (isWeb3(provider)) return new EthereumWallet(new Web3Ethereum({ web3: provider }))
	if (isEthersSigner(provider)) return new EthereumWallet(new EthersEthereum(provider))

	throw new Error("Unsupported provider")
}

function isEthereumProvider(x: any): x is Ethereum {
	return "personalSign" in x && "getFrom" in x && "getChainId" in x
}

function isSolanaProvider(x: any): x is SolanaWalletProvider {
	return "signTransaction" in x && "signAllTransactions" in x && "publicKey" in x
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

function isEthersSigner(x: any): x is EtherSigner {
	return "provider" in x && "signMessage" in x && "signTransaction" in x && x._isSigner && "_signTypedData" in x
}
