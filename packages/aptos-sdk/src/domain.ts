import type { CommittedTransactionResponse, AptosSettings } from "@aptos-labs/ts-sdk"
import type { BigNumber } from "@rarible/types"
import type { CreateCollectionOptions, MintByCollectionNameOptions, MintByCollectionAddressOptions } from "./nft/nft"

export interface AptosNftSdk {
  createCollection(options: CreateCollectionOptions): Promise<{
    tx: CommittedTransactionResponse
    collectionAddress: string
  }>
  mintWithCollectionName(options: MintByCollectionNameOptions): Promise<{
    tx: CommittedTransactionResponse
    tokenAddress: string
  }>
  mintWithCollectionAddress(options: MintByCollectionAddressOptions): Promise<{
    tx: CommittedTransactionResponse
    tokenAddress: string
  }>
  transfer(tokenAddress: string, to: string): Promise<CommittedTransactionResponse>
  burn(tokenAddress: string): Promise<CommittedTransactionResponse>
}

export interface AptosBalanceSdk {
  getAptosBalance({ address }: { address: string }): Promise<BigNumber>
}

export type AptosSdkEnv = "testnet" | "mainnet"

export type AptosSdkConfig = Omit<AptosSettings, "network">

export type WaitForTransactionType = (hash: string) => Promise<CommittedTransactionResponse>
