import type {
	Account,
	CommittedTransactionResponse } from "@aptos-labs/ts-sdk"
import {
	Aptos,
	AptosConfig,
} from "@aptos-labs/ts-sdk"
import { AptosNft } from "./nft/nft"
import type {
	AptosSdkEnv,
	AptosNftSdk,
} from "./domain"
import type { AptosSdkConfig } from "./domain"

export class AptosSdk {
  public readonly nft: AptosNftSdk
  public readonly waitForTransaction: (hash: string) => Promise<CommittedTransactionResponse>

  constructor(account: Account, env: AptosSdkEnv, settings: AptosSdkConfig = {}) {
  	const config = new AptosConfig(settings)
  	const aptos = new Aptos(config)

  	this.nft = new AptosNft(aptos, account)
  	this.waitForTransaction = (hash: string) => aptos.waitForTransaction({ transactionHash: hash })
  }
}
