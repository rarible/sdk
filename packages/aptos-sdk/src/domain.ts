import type { CommittedTransactionResponse, AptosSettings } from "@aptos-labs/ts-sdk"
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk"
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
  sell(tokenAddress: string, feeObjectAddress: string, startTime: number, price: string): Promise<string>

  buy(listing: string): Promise<CommittedTransactionResponse>

  cancel(listing: string): Promise<CommittedTransactionResponse>

  collectionOffer(
    collectionAddress: string,
    amount: number,
    feeObjectAddress: string,
    endTime: number,
    price: string,
  ): Promise<string>

  collectionOfferV1(
    creatorAddress: string | undefined,
    collectionName: string,
    feeObjectAddress: string,
    price: string,
    amount: number,
    endTime: number,
  ): Promise<string>

  acceptCollectionOffer(offer: string, token: string): Promise<CommittedTransactionResponse>
  acceptCollectionOfferV1(
    offer: string,
    tokenName: string | undefined,
    propertyVersion: string,
  ): Promise<CommittedTransactionResponse>

  cancelCollectionOffer(offer: string): Promise<CommittedTransactionResponse>

  tokenOffer(tokenAddress: string, feeObjectAddress: string, endTime: number, price: string): Promise<string>

  tokenOfferV1(
    creatorAddress: string,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    feeObjectAddress: string,
    price: string,
    endTime: number,
  ): Promise<string>

  acceptTokenOffer(offer: string): Promise<CommittedTransactionResponse>

  cancelTokenOffer(offer: string): Promise<CommittedTransactionResponse>

  getFeeScheduleAddress: () => string
  createFeeSchedule(options: { value: number; receiveAddress?: string }): Promise<string>
}

export const supportedNetworks = [AptosNetwork.MAINNET, AptosNetwork.TESTNET] as const
export type SupportedNetwork = (typeof supportedNetworks)[number]

export type AptosSdkConfig = {
  overrides?: Partial<AptosSettings> // this will be passed to aptos' sdk and behave like override
}
export type WaitForTransactionType = (hash: string) => Promise<CommittedTransactionResponse>
export { AptosNetwork }
