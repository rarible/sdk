import type { TypedDataSigner, Signer } from "@ethersproject/abstract-signer"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { Fcl } from "@rarible/fcl-types"
import type { ImxWallet } from "@rarible/immutable-wallet"
import type { Web3 } from "@rarible/web3-ethereum"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Web3 as Web3v4 } from "@rarible/web3-v4-ethereum"
import { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import type { SolanaSigner } from "@rarible/solana-common"
import * as SdkCommon from "@rarible/sdk-common"
import { AptosSdkWallet, isExternalAccount } from "@rarible/aptos-wallet"
import type { ExternalAccount } from "@rarible/aptos-wallet"
import type { BlockchainWallet } from "./"
import { AptosWallet, EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "./"
import { isBlockchainWallet } from "./"
import { ImmutableXWallet } from "./"

export type BlockchainProvider = Ethereum | SolanaSigner | TezosProvider | Fcl
type EtherSigner = TypedDataSigner & Signer
export type EthereumProvider = Web3 | Web3v4 | EtherSigner | ImxWallet
export type AptosProvider = ExternalAccount
export type RaribleSdkProvider = BlockchainWallet | BlockchainProvider | EthereumProvider | AptosProvider

export function getRaribleWallet(provider: RaribleSdkProvider): BlockchainWallet {
	if (isBlockchainWallet(provider)) return provider
	if (isEthereumProvider(provider)) return new EthereumWallet(provider)
	if (isSolanaSigner(provider)) return new SolanaWallet(provider)
	if (isTezosProvider(provider)) return new TezosWallet(provider)
	if (isFlowProvider(provider)) return new FlowWallet(provider)
	if (isImxWallet(provider)) return new ImmutableXWallet(provider)
	if (isEthersSigner(provider)) return new EthereumWallet(new EthersEthereum(provider))
	if (isAptosWallet(provider)) return new AptosWallet(new AptosSdkWallet(provider))
	if (isWeb3(provider)) {
		if (isWeb3v1(provider)) {
			return new EthereumWallet(new Web3Ethereum({ web3: provider }))
		}
		if (isWeb3v4(provider)) {
			return new EthereumWallet(new Web3v4Ethereum({ web3: provider }))
		}
	}
	throw new Error("Unsupported provider")
}

function isEthereumProvider(x: any): x is Ethereum {
	return "personalSign" in x && "getFrom" in x && "getChainId" in x
}

function isSolanaSigner(x: any): x is SolanaSigner {
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

function isImxWallet(x: any): x is ImxWallet {
	return "link" in x && "network" in x && "getConnectionData" in x
}

export function isWeb3v1(x: Web3 | Web3v4): x is Web3 {
	return SdkCommon.isWeb3v1(x)
}

export function isWeb3v4(x: Web3 | Web3v4): x is Web3v4 {
	return SdkCommon.isWeb3v4(x)
}

function isAptosWallet(x: any): x is AptosProvider {
	return isExternalAccount(x)
}
