import type { Account as GenericAccount } from "@aptos-labs/ts-sdk"

export interface AptosWalletInterface {
  signMessage(message: string, options?: { nonce: string }): Promise<{ message: string; signature: string }>
  getAccountInfo(): Promise<{ address: string; publicKey: string; network: Network }>
  signAndSubmitTransaction(payload: AptosTransaction): Promise<{ hash: string }>
}

export type ExternalAccount = {
  signAndSubmitTransaction: (payload: EntryFunctionPayload) => Promise<{ hash: string }>
  signMessage: (payload: SignMessagePayload) => Promise<SignMessageResponse>
  connect: () => Promise<AccountInfo>
  account: () => Promise<AccountInfo>
  disconnect: () => Promise<AccountInfo>
  network: () => Promise<Network>
  onAccountChange: (callback: (account: string) => void) => Promise<void>
  onNetworkChange: (callback: (network: string) => void) => Promise<void>
  onDisconnect: (callback: () => void) => Promise<void>
}

export interface SignMessagePayload {
  address?: boolean // Should we include the address of the account in the message
  application?: boolean // Should we include the domain of the dapp
  chainId?: boolean // Should we include the current chain id the wallet is connected to
  message: string // The message to be signed and displayed to the user
  nonce: string // A nonce the dapp should generate
}

export interface SignMessageResponse {
  address: string
  application: string
  chainId: number
  fullMessage: string // The message that was generated to sign
  message: string // The message passed in by the user
  nonce: string
  prefix: string // Should always be APTOS
  signature: string // The signed full message
}

export type EntryFunctionPayload = {
  function: string
  /**
   * Type arguments of the function
   */
  // eslint-disable-next-line camelcase
  type_arguments: Array<string>
  /**
   * Arguments of the function
   */
  arguments: Array<any>
}

export type AptosTransaction = {
  arguments: Array<any>
  typeArguments: Array<string>
  function: string
}

export type AccountInfo = {
  address: string
  publicKey: string
}

export enum Network {
  Testnet = "Testnet",
  Mainnet = "Mainnet",
  Devnet = "Devnet",
}

export { GenericAccount }
