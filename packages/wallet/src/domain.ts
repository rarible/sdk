import type Web3 from "web3"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { TypedDataSigner, Signer } from "@ethersproject/abstract-signer"
import type { Fcl } from "@rarible/fcl-types"
import type { ImxWallet } from "@rarible/immutable-wallet"
import type { SolanaSigner } from "@rarible/solana-common"
import type { ExternalAccount as AptosExternalAccount } from "@rarible/aptos-wallet"
import type { WalletCore as AptosWalletCore } from "@rarible/aptos-wallet/build/wallets/wallet-core"
import type { BlockchainWallet } from "./wallets"

export type EtherSigner = TypedDataSigner & Signer

export type BlockchainProvider = Ethereum | SolanaSigner | Fcl

export type EthereumProvider = Web3 | EtherSigner

export type AptosProvider = AptosExternalAccount | AptosWalletCore

export type RaribleSdkProvider = BlockchainWallet | BlockchainProvider | EthereumProvider | AptosProvider | ImxWallet

export type UserSignature = {
  signature: string
  publicKey: string
  message: string
}

export interface AbstractWallet<T extends WalletType> {
  walletType: T
  signPersonalMessage(message: string): Promise<UserSignature>
}

/**
 * @todo should be replaced with L1 Blockchain from rarible/types@0.10.
 * @note will be removed in 0.14.x
 */

export enum WalletType {
  ETHEREUM = "ETHEREUM",
  SOLANA = "SOLANA",
  FLOW = "FLOW",
  IMMUTABLEX = "IMMUTABLEX",
  APTOS = "APTOS",
}
