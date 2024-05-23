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

export interface AptosOrderSdk {
	sell(
		tokenAddress: string,
		feeObjectAddress: string,
		startTime: number,
		price: string
	): Promise<string>

	buy(
		listing: string,
	): Promise<CommittedTransactionResponse>

	cancel(
		listing: string,
	): Promise<CommittedTransactionResponse>

	collectionOffer(
		collectionAddress: string,
		amount: number,
		feeObjectAddress: string,
		endTime: number,
		price: string
	): Promise<string>

	acceptCollectionOffer(
		offer: string,
		token: string
	): Promise<CommittedTransactionResponse>

	cancelCollectionOffer(
		offer: string,
	): Promise<CommittedTransactionResponse>

	tokenOffer(
		tokenAddress: string,
		feeObjectAddress: string,
		endTime: number,
		price: string
	): Promise<string>

	acceptTokenOffer(offer: string): Promise<CommittedTransactionResponse>

	cancelTokenOffer(offer: string): Promise<CommittedTransactionResponse>

	getFeeScheduleAddress: () => string
	createFeeSchedule(options: { value: number, receiveAddress?: string}): Promise<string>
}

export type AptosSdkEnv = "testnet" | "mainnet"

export type AptosSdkConfig = Omit<AptosSettings, "network">

export type WaitForTransactionType = (hash: string) => Promise<CommittedTransactionResponse>
